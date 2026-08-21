# Toki Pona Drills — version 1

An offline Android trainer built for quick practice rather than gamification.

Version one includes:

- seven lessons, from the core sentence pattern through simplifying adult ideas;
- multiple-choice and matching drills only—no keyboard entry;
- actual UCSUR sitelen pona characters beside every displayed Latin-script Toki Pona word;
- a daily queue that puts due mistakes and weak material first;
- local mistake counts, spaced-review dates, practice history, time, and a 35-day calendar;
- no account, ads, scores, streak pressure, network permission, or analytics.

## Install

Copy `Toki-Pona-Drills-v1.0.1.apk` to an Android device and open it. Android may ask for permission to install an app from the file-opening app. Progress is stored inside the app and survives ordinary restarts. Clearing app storage or uninstalling it removes that progress.

## Work on the lesson data

The lessons are ordinary data in `app/src/main/assets/www/data/lessons.js`. The Unicode mapping is in `app/src/main/assets/www/data/lexicon.js`. Application logic is split into small files under `core/` and `ui/`.

Run the dependency-free test suite with:

```sh
npm test
```

## Rebuild the APK

The application is local HTML, CSS, and JavaScript in a WebView, with a minimal Android wrapper in Smali. It contains no Java or Kotlin application source.

The included build script uses Apktool 2.x and Android's `zipalign` and `apksigner`. Alignment must happen before signing; modern Android rejects an APK whose uncompressed resource table is not aligned on a four-byte boundary.

```sh
./scripts/build_apk.sh \
  /path/to/apktool.jar \
  /path/to/zipalign \
  /path/to/apksigner.jar
```

The script creates a local development signing key under `build/` when one does not exist. For a release, set `TOKI_PONA_SIGNING_KEY_PATH` and `TOKI_PONA_SIGNING_KEY_PASSWORD` to the retained private release key. Android accepts a later APK as an update only when it uses that same signing identity and a larger version code.

## Font

The app embeds **sitelen seli kiwen asuki** by KreativeKorp / jan Lepeka under the SIL Open Font License 1.1. Its license is included beside the font in the app assets.

The application source is MIT-licensed; see `LICENSE`.
