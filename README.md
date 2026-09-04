# Seanchló Typer #

## Convert Irish text to seanchló as you type. ##

### Seanchló typer
Type Irish in the spelling you already know and watch it turn into the old script as you go.
-   Eight traditional Gaelic typefaces from [gaelchló](https://www.gaelchlo.com/)
-   The ponc séimhithe applied live - no clicking, no refreshing
-   Optional insular letterforms (ꝺ ꝼ ᵹ ꞃ ꞅ ꞇ) and the Tironian ⁊ for *agus*
-   Reverse mode: paste seanchló, get modern spelling back
-   Copy the result, or save it as an image card
-   Text to speech using the best Irish speech synthesis: Abair.ie

Try it here: https://mkeenan-kdb.github.io/seanchlo/

![ezgif-5-d84bef9c92](https://github.com/user-attachments/assets/017fd7e8-fabf-493f-a203-6be7916a2ffc)

## IrishApps homepage

Check my other projects and youtube where I document progress etc; https://www.youtube.com/@UncleMick

[Click here](https://mkeenan-kdb.github.io/IrishApps/) to access the IrishApps homepage.

## Development

No build step - it is static HTML, CSS and JS. Open `index.html`, or serve the
folder with `python3 -m http.server` if you want the fonts and JSON to load
over http.

The transformation tables are the whole product, so they have a check:

```
node js/test.js
```

It round-trips every conversion (lenition, insular forms, Tironian) back to
modern spelling and fails if any mapping loses information.
