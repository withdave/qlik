import "./auth.js";
import { qix } from "@qlik/api";

const QVD_PATH = "lib://DataFiles/session_app_demo.qvd";
const PAGE_SIZE = 1000;

const script = `
TempTable:
LOAD * FROM [${QVD_PATH}] (qvd);
`;

function hypercubeProperties(fieldNames) {
  return {
    qInfo: { qType: "qcs-session-app-qvd-demo" },
    qHyperCubeDef: {
      qDimensions: fieldNames.map((name) => ({ qDef: { qFieldDefs: [name] } })),
      qMeasures: [],
      qInitialDataFetch: [{ qTop: 0, qLeft: 0, qHeight: 0, qWidth: fieldNames.length }],
    },
  };
}

async function* readAllRows(hypercube, fieldNames) {
  const width = fieldNames.length;
  let top = 0;
  for (;;) {
    const [page] = await hypercube.getHyperCubeData("/qHyperCubeDef", [
      { qTop: top, qLeft: 0, qHeight: PAGE_SIZE, qWidth: width },
    ]);
    const rows = page.qMatrix;
    if (rows.length === 0) return;

    for (const cells of rows) {
      const row = {};
      fieldNames.forEach((name, i) => {
        const cell = cells[i];
        row[name] = Number.isFinite(cell.qNum) ? cell.qNum : cell.qText;
      });
      yield row;
    }

    if (rows.length < PAGE_SIZE) return;
    top += rows.length;
  }
}

async function main() {
  const appId = `SessionApp_${Math.random().toString(32).slice(2)}`;
  const session = qix.openAppSession({ appId });

  try {
    const app = await session.getDoc();
    await app.setScript(script);
    await app.doReload();

    const fields = await app.getFieldList();
    const fieldNames = fields.filter((f) => !f.qIsSystem && !f.qIsHidden).map((f) => f.qName);

    const hypercube = await app.createSessionObject(hypercubeProperties(fieldNames));
    for await (const row of readAllRows(hypercube, fieldNames)) {
      process.stdout.write(JSON.stringify(row) + "\n");
    }
  } finally {
    await session.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
