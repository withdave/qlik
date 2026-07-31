import "./auth.js";
import { qix } from "@qlik/api";

const QVD_PATH = "lib://DataFiles/session_app_demo.qvd";
const ROW_COUNT = 10000;

const script = `
TempTable:
LOAD
    RecNo() as ID,
    'Item_' & RecNo() as Name,
    Round(Rand() * 1000) as Value
AutoGenerate ${ROW_COUNT};

STORE TempTable INTO [${QVD_PATH}] (qvd);
`;

async function main() {
  const appId = `SessionApp_${Math.random().toString(32).slice(2)}`;
  const session = qix.openAppSession({ appId });

  try {
    const app = await session.getDoc();
    await app.setScript(script);
    await app.doReload();

    console.log(`Reload complete. Stored ${ROW_COUNT} row(s) to ${QVD_PATH}`);
  } finally {
    await session.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
