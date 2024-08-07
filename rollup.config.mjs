import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import cleaner from "rollup-plugin-cleaner";

export default {
    input: "src/index.ts",
    output: [
        {
            dir: "dist",
            format: "cjs",
            sourcemap: true
        },
        {
            dir: "dist/esm",
            format: "esm",
            sourcemap: true
        }
    ],
    plugins: [
        cleaner({
            targets: [
                "./dist/"
            ]
        }),
        resolve(),
        commonjs(),
        typescript({
            useTsconfigDeclarationDir: true
        })
    ]
};