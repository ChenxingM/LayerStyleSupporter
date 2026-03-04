const fs = require('fs');
const path = require('path');

class ExtendScriptPlugin {
    apply(compiler) {
        compiler.hooks.done.tap('TsAEPlugin', (stats) => {
            const outputDir = stats.compilation.outputOptions.path;
            const fileNames = stats.compilation.assets;

            for (const fileName in fileNames) {
                if (fileName.match(/\.(jsx|js|map)$/) == false) { continue; }

                const filePath = path.resolve(outputDir, fileName);
                const bom = Buffer.from([0xef, 0xbb, 0xbf]);

                let buff = fs.readFileSync(filePath);
                buff = bom + buff.toString().replace(/\/\/\ ?@ts-/g, '// (@)ts-');

                fs.writeFileSync(filePath, buff, 'utf8');
            }
        });
    }
}

module.exports = ExtendScriptPlugin;
