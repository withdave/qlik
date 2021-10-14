# Generic Links on Qlik Cloud Services

## Creating links via CLI

We can pass an object/ array, or load a file using the CLI. It is not currently a public API endpoint.

```
qlik raw post v1/generic-links --body-file "link.json"
```

Contents of the JSON file
```
{"name": "Help","link" :" https://help.qlik.com/"}
```
