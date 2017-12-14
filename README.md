# HebbianJS
A framework for using Hebbian Learning (neural networks) in javascript

## Setup

### In Short

* Load framework in HTML:
* Create a neural network per entity that's going to use one
* Give the NN input values, and receive an array with the outputs
* Tell the NN wheter it did a good job (stay the same) or not (change the weights)

### Load Framework

```<script language="JavaScript" src="HebbianJS.js"></script>```

### Create Neural Network

Every entity (for example; every robot) should have its own neural network.

```
this.neuralNetwork = NNFramework.model({
  learning_rate: 0.000001, // The learning rate
  weight_history_size: Math.Infinity, // How many weight changes should be taken into account
  input: 4, // How many input nodes are there (all the sensors of the robot)
  hidden: [2], // How many hidden nodes are there? To add a layer, just add the number of nodes of that layer (so two hidden layers, with 3 and 4 nodes would be: [3, 4])
  output: 1, // How many output nodes are there? (if you want torque and speed, this should be 2)
  labels: { // Labels are not yet documented; you don't need these
    nodes: {
      '0.0': 'DR',
      '0.1': 'DL',
      '0.2': 'TR',
      '0.3': 'TL',
    },
    connections: {
      '0.0': 'first connection'
    }
  },
  overrides: { // Change the initial values of connections
    '0.2.0': { // The connection from layer 0, node 2 to layer 1 node 0
      'weight': 1 // Set a weight to 1. Default (no override) is '0'
    },
    '0.2.1': { // The connection from layer 0, node 2 to layer 1 node 1
      'weight': 1
    },
    '0.3.0': { // The connection from layer 0, node 3 to layer 1 node 0
      'weight': 1
    },
    '0.3.1': { // The connection from layer 0, node 3 to layer 1 node 1
      'weight': 1
    },
    '1.0.0': { // The connection from layer 1, node 0 to layer 2 node 0
      'weight': 1
    },
    '1.1.0': { // The connection from layer 1, node 1 to layer 2 node 0
      'weight': 1
    }
  }
});
```

### Get Predictions

The .predict() method requires an array as an input, that has the length as the 'input' value you've set in the model. Here, DR, DL, TR and TL are sensor values.

It returns an array with the length of the 'output' value you've set in the model above.

Call this method in the robotMove loop.

```
const NN_RESULTS = robot.neuralNetwork.predict([DR, DL, TR, TL]);
const TORQUE = NN_RESULTS[0] * MAX_TORQUE;
```

### Teach the Neural Network

The .learn() method requires a boolean. 'True' for everything is okay, 'false' for 'I don't want this'. Call this method each time you call the .predict() method, just after calling that method.

```
robot.neuralNetwork.learn(!bTOUCHING_ANY);
```
