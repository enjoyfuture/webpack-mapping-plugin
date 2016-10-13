# webpack-mapping-plugin
Webpack plugin for generating a mapping corresponding to the original file name and the output file name.

## Usage

In your webpack.config.js

```javascript
import MappingPlugin from 'webpack-mapping-plugin';

module.exports = {
    // ...
    plugins: [
      new MappingPlugin({
        // ...
      })
    ]
};
```

This will generate a mapping.json file in your root output directory with a mapping 
of all source file names to their corresponding output file, for example:

```json
{
  "index.css": "css/index.ca5be16b420dcfa51cfc.css",
  "index.js": "index.ca5be16b420dcfa51cfc.js"
}
```


## Configuration

A mapping is configurable using constructor options:

```javascript
new MappingPlugin({
  fileName: 'my-mapping.json',
  basePath: '/app/'
})
```

## Options:

* fileName: The mapping filename in your output directory (mapping.json by default).
* basePath: A path prefix for all file references. Useful for including your output path in the mapping.(by default is '')
* stripSrc: removes unwanted strings from source filenames
* cache: In multi-compiler mode webpack will overwrite the mapping on each compilation. 
  Passing a shared {} as the cache option into each compilation's MappingPlugin will combine the mapping between compilations.

## Development Build

```bash
npm run compile
```