# Bad Max airplan writer: ✈

**For when you don't have ADMACS (maybe even when you do! 🤣)**

<!-- [![Padawan Host](https://code.il2.dso.mil//tron/products/dod-open-source/digitize/badmax/badges/master/pipeline.svg)](https://websites.dso.mil/sites/badmax/) -->
[![Digitize Host](https://code.il2.dso.mil//tron/products/dod-open-source/digitize/badmax/badges/master/pipeline.svg)](https://digitize-il4.staging.dso.mil/sites/badmax/)
[![Digitize Host](https://code.il2.dso.mil//tron/products/dod-open-source/digitize/badmax/badges/master/pipeline.svg)](https://digitize.apps.dso.mil/sites/badmax/)

Version: 0.6.8

Writing airplans in PowerPoint or Excel is a big bummer 🤬.
Never again will you chained to dragging around little lines on the screen ⛓.
This is a simple web app that allows you to view and edit your unit's flight plans 📋.
You can add new flights, edit existing flights, and delete flights. You can also export your flight plans to PDF.

Tips:

- To get started, click the blue  in the menu to add a new squadron.
- You can add cycles by clicking the "+ Add Cycle" button and providing the cycle times
- Next add an aircraft line by clicking the "+ Add Line" button.
- Sorties are added into a line by clicking "+ Add Sortie" within a line in the list.
- Save your airplan by clicking the  button. This will download a file that you can upload later to resume your progress.
- **Best Practice**: Add all of your squadrons, then save your airplan. Use that file as your starting point for the future.
- **Pro Tip**: View these tips anytime by clicking the  help icon in the menu.

Play around, you can't break anything, and hopefully you find this app useful!

Please provide feedback to Jarvis at [alexander.j.buck10.mil@us.navy.mil](mailto:alexander.j.buck10.mil@us.navy.mil) by clicking the green "Feedback" button in the menu.


## Workbox
Service worker and offline functionality is created through workbox libraries. Due to CORS restrictions, the workbox library is self hosted. The easiest way to update the workbox library to the latest version is the following commands, _this requires npx_:

```console
~\Repositories\badmax > npx workbox-cli copyLibraries src/libraries
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.
The Workbox libraries were copied to <...>/badmax/src/libraries/workbox-v6.5.4
Add a call to workbox.setConfig({modulePathPrefix: '...'}) to your service worker to use these local libraries.
See https://goo.gl/Fo9gPX for further documentation.
```

This results in a `workbox-vX.Y.Z/` folder inside the `src/libraries` folder. Then update `service-worker.js` on the `importScript` call and the `workbox.setConfig` call to reference the new version.