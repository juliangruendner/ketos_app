npm run env -s && ng build --prod --base-href=/hb
rm hb.zip
zip -r hb.zip dist/
