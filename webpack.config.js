import CopyPlugin from "copy-webpack-plugin";
import FileManagerPlugin from "filemanager-webpack-plugin";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import imageminWebp from "imagemin-webp";
import JsonMinimizerPlugin from "json-minimizer-webpack-plugin";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";

import packageJson from "./package.json" assert { type: "json" };
import CompendiumPack from "./src/util/compendium-pack.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('webpack').Configuration} */
const config = {
    entry: {},
    experiments: { outputModule: true },
    output: {
        assetModuleFilename: "[name][ext]",
        clean: true,
        filename: "[name].js",
        library: { type: "module" },
        path: resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: { compilerOptions: { noEmit: false } },
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: ["...", new JsonMinimizerPlugin()],
    },
    resolve: { extensions: [".ts", ".js"] },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    context: "src",
                    from: "lang/**/*.json",
                    to: resolve(__dirname, "dist"),
                },
                {
                    context: "src",
                    from: "assets/**/*.{png,svg,webp}",
                    to: resolve(__dirname, "dist"),
                    async transform(content) {
                        return imagemin.buffer(content, {
                            plugins: [
                                imageminPngquant(),
                                imageminSvgo(),
                                imageminWebp(),
                            ],
                        });
                    },
                },
            ],
        }),
        new WebpackManifestPlugin({
            fileName: "module.json",
            filter: (file) =>
                file.name.endsWith(".js") || file.name.endsWith(".json"),
            generate: (_, files, __) => ({
                id: packageJson.name,
                name: packageJson.name,
                title: packageJson.title,
                description: packageJson.description,
                version: packageJson.version,
                author: packageJson.author.name,
                system: ["pf2e"],
                minimumCoreVersion: "10",
                compatibleCoreVersion: "10",
                url: packageJson.homepage,
                protected: true,
                download: `${packageJson.homepage}/releases/download/latest/ponyfinder-bestiary-foundryvtt-module.zip`,
                manifest: `${packageJson.homepage}/releases/download/latest/module.json`,
                esmodules: files
                    .filter(
                        (file) =>
                            file.name.startsWith("scripts/") &&
                            file.name.endsWith(".js")
                    )
                    .map((file) => file.name),
                languages: files
                    .filter(
                        (file) =>
                            file.name.startsWith("lang/") &&
                            file.name.endsWith(".json")
                    )
                    .map((file) => ({
                        lang: file.name
                            .replace(/.*\//, "")
                            .replace(/\.json$/i, ""),
                        name: new Intl.DisplayNames("en-US", {
                            type: "language",
                        }).of(
                            file.name
                                .replace(/.*\//, "")
                                .replace(/\.json$/i, "")
                        ),
                        path: file.name,
                    })),
                packs: [
                    {
                        name: "ponyfinder-bestiary-actions",
                        label: "Ponyfinder Actions",
                        path: "packs/ponyfinder-actions.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-ancestries",
                        label: "Ponyfinder Ancestries",
                        path: "packs/ponyfinder-ancestries.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-effects",
                        label: "Ponyfinder Effects",
                        path: "packs/ponyfinder-effects.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-feats",
                        label: "Ponyfinder Feats",
                        path: "packs/ponyfinder-feats.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-heritages",
                        label: "Ponyfinder Heritages",
                        path: "packs/ponyfinder-heritages.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-items",
                        label: "Ponyfinder Items",
                        path: "packs/ponyfinder-items.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-npc-actions",
                        label: "Ponyfinder NPC Actions",
                        path: "packs/ponyfinder-npc-actions.db",
                        type: "Item",
                        system: "pf2e",
                    },
                    {
                        name: "ponyfinder-bestiary-npc-gallery",
                        label: "Ponyfinder NPC Gallery",
                        path: "packs/ponyfinder-npc-gallery.db",
                        type: "Actor",
                        system: "pf2e",
                    },
                ],
                flags: {
                    "ponyfinder-bestiary-foundryvtt-module": {
                        "pf2e-homebrew": {
                            creatureTraits: {
                                beastfolk: "Beastfolk",
                            },
                            featTraits: {
                                testFeatTrait: "Test Feat Trait",
                            },
                            languages: {
                                reptim: "Reptim"
                            }
                        },
                    },
                },
            }),
        }),
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap("CreateFoundryPacksPlugin", () => {
                    const packsDataPath = resolve(__dirname, "src", "packs");
                    readdirSync(packsDataPath)
                        .map((dirName) =>
                            resolve(__dirname, packsDataPath, dirName)
                        )
                        .map((dirPath) => CompendiumPack.loadJSON(dirPath))
                        .forEach((pack) => pack.save());
                });
            },
        },
        new FileManagerPlugin({
            events: {
                onEnd: {
                    archive: [
                        {
                            source: resolve(__dirname, "dist"),
                            destination: resolve(
                                __dirname,
                                "dist",
                                "ponyfinder-bestiary-foundryvtt-module.zip"
                            ),
                        },
                    ],
                },
            },
        }),
    ],
};
export default config;
