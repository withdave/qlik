# Identify attached files

This powershell script scans the static content directory and outputs a CSV file containing file names and sizes. This can then be interrogated in Qlik Sense to add application names.

Open a powershell window at the root of your persistance share (the location of this can be found in the "Service Cluster" section in the Qlik Sense QMC), and run the script below

```
dir -Path ".\StaticContent\AppContent" -Recurse -File | Select FullName, Length | Export-Csv "AttachedFiles.csv"
```
