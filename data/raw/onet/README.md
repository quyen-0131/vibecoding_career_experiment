# O*NET source files

The prototype uses O*NET 30.3 occupation, task, work-activity, essential-skill,
and transferable-skill workbooks as source data. Large source workbooks are not
shipped to the browser or committed here.

To regenerate the compact local index, download the named `.xlsx` files from
the O*NET database and run:

```powershell
python scripts/generate-onet-taxonomy.py data/raw/onet
```

O*NET describes occupations. It does not prove that a CV sentence demonstrates
a skill, so the app keeps resume evidence and role evidence separate.
