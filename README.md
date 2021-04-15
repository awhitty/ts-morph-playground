<img src="public/logo.svg" alt="ts-morph-playground logo" width="200">

# ts-morph-playground

ts-morph-playground is a simple UI that makes it easy to prototype large-scale automated refactors for TypeScript projects using [ts-morph](https://github.com/dsherret/ts-morph). It includes just enough to write and run a transform on a mock TypeScript project that spans multiple files from your browser.

## Documentation

### UI

The UI is composed of four panels: two editors on the left and two viewers on the right.

The editor on top allows you to write input files that represent a mock TypeScript project. The editor on bottom is where you can write a transform function.

The viewer on top shows a simple representation of the AST of the currently visible input file. It's useful for reference while trying to figure out how to target a particular node in the transform. The viewer on bottom shows the result of running the transform on the input project.

### Writing a Transform

The transform is a module that exports a default function that takes a `Project` as input:

```ts
import { Project } from 'ts-morph';

export default function transform(project: Project) {
    /* ... */
}
```

The [ts-morph docs](https://ts-morph.com/manipulation/) are the best resource for learning how to use the library to make changes to a project.

It is expected that the transform will mutate the project in-place. You do not need to `.save()` the project. This is best seen in the examples.


### Sharing Links and Saving Work

Inputs and transforms are persisted to your URL bar! You may use it to bookmark your work or share it with your friends and coworkers. They'll love it.

Your current work is also saved to local storage, so have no fear closing your tab!

## Contributing

Contributions are always welcome! Some key features begging to be implemented:

- Add and remove input files
- Display more information in the AST viewer and add a click-to-copy interaction for useful values
- Configure compiler options
- Import additional libraries from the transform
- More examples!
- Shorter named URLs for examples

This project is certainly still young, and even opening an issue would be a useful contribution.

