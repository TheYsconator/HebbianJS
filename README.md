# HebbianJS

## In Short

HebbianJS is a framework written in javascript that allows for easy Hebbian Learning (neural networks).

### Authors

All research regarding neural networks has been done by **Denise van Baalen**. The framework has been set up by, and has mainly been written by **Ysbrand van Eijck**, with the essential help of **Jeremy Constantin Börker**. The documentation has been written by Ysbrand van Eijck.

These people are all students Bachelor Artificial Intelligence at the Radboud University Nijmegen. This framework has been made as part of our educational programme. We were to implement Hebbian Learning in a javascript Didabots framework for the course Cognitive Robotics, as taught by George Kachergis.

### Copyright

The framework is licensed under GPL-3.0 by Ysbrand van Eijck, and it is recommended to take a look at the included licence before using and or distributing (part of) the framework.

## Getting HebbianJS

The latest version of the framework can be found [on github; https://github.com/TheYsconator/HebbianJS](https://github.com/TheYsconator/HebbianJS).

## Developing HebbianJS

HebbianJS is no longer actively maintained. However, you can still find the documentation of the source code in this section, may you wish to tinker around with it yourself.

HebbianJS has no external dependencies, and is added to the window object at ```window.NNFramework``` for your convenience.

### Source Code Structure

HebbianJS uses one **publicly** usable object, namely ```NNFramework```. This object has the following three child objects, that are all **privately** used: ```NNNode```, ```NNConnection``` and ```NNModel```. Below is a short description of all of these objects and their contained methods. Methods starting with an *underscore* (```_foo()```) are **privately** used, others are meant to be used **publicly**. Methods called '\_init' (```_init(<params>)```) are considered constructors, and are documented in the section of the object, not as a separate method.

#### NNFramework

The all-in holder object for HebbianJS. It contains all other required objects, helper methods and public methods.

##### NNModel .model(Object model)

Returns a NNModel object that one can use in their project, given a 'model'. A model is a human-readable configuration set for a NNFramework, with the following form:

```javascript
{
  learning_rate: <float>,
  weight_history_size: <int>,
  input: <int>,
  hidden: <int[]>,
  output: <int>,
  labels: {
    nodes: { // '0.0' is the 'label address'
      '0.0': <string *>,
      ...
    },
    connections: { // '0.0' is the 'label address'
      '0.0': <string *>,
      ...
    }
  },
  overrides: {
    '0.0.0': { // '0.0.0' is the 'override address'
      'passive': <boolean *>
      'weight': <int *>,
    },
    ...
  }
```

* ```learning_rate``` is a *required float* that determines the learning rate of the model. A negative value is untested.
* ```weight_history_size``` is a *required int*. ```Math.Infinity``` would basically disable this functionality. Setting a non-infinite value will only store the last ```weight_history_size``` number of weight deltas. Only steps in which the model actually 'learned' something are counted. This works like a FIFO system. A negative value is untested.
* ```input``` is a *required int* that determines the amount of nodes on the input layer. A negative value and zero are untested.
* ```hidden``` is a *required list of ints* that determines both the amount of hidden layers, and the amount of nodes per each of these hidden layers. The length of the list determines the amount of hidden layers, the values determine the amount of nodes of these layers. This can be an empty array, if no hidden layers are needed. Negative values and zeroes are untested.
* ```output``` is a *required int* that determines the amount of nodes on the output layer. A negative value and zero are untested.
* ```labels``` is a *required object of nodes and connections*.
* ```nodes``` is a *required object of label address-node label pairs*, though no actual pairs are required (in which case default addressing is used).
  * *label address-node label pairs* can override the addresses of nodes by a human-readable name. This can be useful for debugging purposes. A label address has the following form: ```'<int>.<int>'```, where the first int is the layer index of the node (starting from zero), and the second int is the node index of the node in that layer (starting from zero).
* ```connections``` is a *required object of label address-connection label pairs*, though no actual pairs are required (in which case default addressing is used).
  * *label address-connection label pairs* can override the addresses of connections by a human-readable name. This can be useful for debugging purposes. A connection address has the following form: ```'<int>.<int>'```, where the first int is the layer index of the *parent* node (starting from zero), and the second int is the node index of the *parent* node in that layer (starting from zero).
    * A **parent** node is the node in the layer closest to the input layer,
    * whereas a **child** node is the node in the layer closest to the output layer.
* ```overrides``` is a *required object of override address-override settings pairs*, though no actual pairs are required (in which case all nodes use the default initial passiveness of ```false``` and weight of ```0```).
  * *override address-override settings pairs* can override the initial passiveness and weight of a connection. A override address has the following form: ```'<int>.<int>.<int>'```, where the first int is the *parent layer (index)*, the second int is the *parent node (index)* and the last int is the *child node (index)*. It is assumed that the child layer (index) is the parent layer index plus one. For the definitions of parent and child; please see above in bold.
    * ```passive``` is an *optional boolean* that determines the passiveness of a connection. A passive connection (```'passive': true,```) means that the the framework will pretend the connection does not exist. Since the framework initially uses **fully connected** models, this allows for pretended **non-fully connected** models.
    * ```weight``` is an *optional float* that determines the initial weight of a connection.

#### NNNode(int layer_index, int node_index)

A NNNode represents a neural network node. It is used by NNModel, along with other NNNodes and NNConnections, to make for a NNModel. NNNode is a holder object.

This object contains the following variables:
* ```.layer_index``` \<int>: The layer index this node is in. Part of the *address* of the node. Set on construction by the ```layer_index``` parameter.
* ```.node_index``` \<int>: The node index of this node in its layer. Part of the *address* of the node. Set on construction by the ```node_index``` parameter.
* ```.activation``` \<int>: The latest activation value of this node. Initially set to ```0```.
* ```.label``` \<string>: A human readable label of this node, that can be used for debugging. Initially set to ```null```.

This object contains no non-constructor methods.

#### NNConnection(int from_layer, int from_node, int to_node)

A NNConnection represents a neural network connection between nodes. It is used by NNModel, along with other NNConnections and NNNodes, to make for a NNModel. NNConnection is a holder object.

This object contains the following variables:
* ```.from_layer``` \<int>: The index of the layer of the parent node. Part of the *address* of the connection. Set on construction by the ```from_layer``` parameter.
* ```.from_node``` \<int>: The index of the parent node in its layer. Part of the *address* of the connection. Set on construction by the ```from_node``` parameter.
* ```.to_layer``` \<int>: The index of the layer of the child node. Initially set to ```.from_layer + 1```.
* ```.to_node``` \<int>: The index of the child node in its layer. Part of the *address* of the connection. Set on construction by the ```to_node``` parameter.
* ```.weight``` \<float>: The weight of the connection. Initially set to ```0```.
* ```.passive``` \<boolean>: Whether this connection is passive or not. Initially set to ```false```.
* ```.weight_history``` \<float[]>: An array holding all weight deltas. Weight deltas are only added when the model has actually learned something. The data in this array can be used to implement (a form of) forgetting/ memory to the neural network. Initially set to ```[]```.
* ```.label``` \<string>: A human readable label of this connection, that can be used for debugging. Initially set to ```null```.

This object contains no non-constructor methods.

#### NNModel(Object model)

A NNModel uses both NNNodes and NNConnections, along with its own methods, to make for a neural network.

This object contains the following variables:
* ```.learning_rate``` \<float>: The same as and initially set to ```learning_rate``` of the passed model.
* ```.weight_history_size``` \<int>: The same as and initially set to ```weight_history_size``` of the passed model.
* ```.nodes``` \<\[\[NNNode]]>: A list of lists of NNNodes. See ```._generateNodes(int, int[], int)```.
* ```.connections``` \<\[\[NNConnection]]>: A list of lists of NNConnections. See ```._generateConnections()```.

During construction, the following methods are also called (in order):
* ```obj._generateNodes(model.input, model.hidden, model.output)```
* ```obj._generateConnections()```
* ```obj._setLabels(model.labels)```
* ```obj._handleOverrides(model.overrides)```

The methods contained in this object are listed below.

##### int .\_numberOfLayers()

Returns the number of layers the model has.

##### int .\_numberOfNodes(int layer)

Returns the number of nodes in a layer, given that layer's index (starting from 0).

##### undefined .\_generateNodes(int input, int[] hidden, int output)

Fills the object's ```.nodes``` with initialised NNNodes, according to the passed parameters. After calling this method, ```.nodes``` will have the following structure:

```javascript
.nodes = [
  [NNNode, ...],
  ...
  [NNNode, ...]
]
```

Or, in short: ```.nodes = [x [y NNNode]]```, where x is the amount of layers of the model, and y is the amount of nodes in that layer. The layer with index ```0``` always is the input layer. The layer with the last index always is the output layer.

##### undefined .\_generateConnections()

Fills the object's ```.connections``` with initialised NNConnections, according to the structure of ```.nodes```. After calling this method, ```.connections``` will have the following structure:

```javascript
.connections = [
  [NNConnection, ...],
  ...
  [NNConnection, ...]
]
```

Or, in short: ```.connections = [x [y NNConnection]]```, where x is the amount of layers in the model minus one (results in the amount of connection layers) and y is the amount of connections per layer. Since all nodes in the parent layer are connected to all nodes in the child layer, this results in a y of #nodes in parent layer times #nodes in child layer. The order of the connections in a connection layer is: top to bottom, right before left.

For example, with the following two layers (the first containing nodes A, B and C, and the second containing the nodes D and E):
```
 A D
 B E
 C
```

The order in ```.connections``` would be:
```[[AD, AE, BD, BE, CD, CE]]```

##### undefined .\_handleOverrides(Object overrides)

Sets all the overrides that were defined by the model. All addresses that are not mentioned by the overrides are left untouched.

##### NNNode .\_getNode(string name)

Returns the first node of which the passed ```name``` is equal to the label of that node. If no such node can be found, this method returns ```undefined```.

##### NNConnection .\_getConnection(string name)

Returns the first connection of which the passed ```name``` is equal to the label of that connection. If no such connection can be found, this method returns ```undefined```.

##### undefined .\_setLabels(Object labels)

Sets all the labels that were defined by the model. All addresses that are not mentioned by the labels object are left untouched.

##### int[] .predict(int[] inputs)

One of the two public methods of NNModel, along with ```.learn(boolean)```. This method calculates and sets the activation of each node, and **returns** the resulted activations of the output layer.

The activations of the input layer are set by copying the ```inputs``` parameter to it. Therefore, the length of ```inputs``` should be the same as the value for ```input``` in the model (or, in other words; the amount of input nodes).

After the activations of the nodes in the input layer have been set, the activations of the child nodes are determined. This continues up and until the output nodes have been reached.

Per (child) node, its new activation value is determined as follows:

* A pool is made of all connections *to* the child node;
* From this pool, all connections that have ```passive``` value of ```true``` are removed.
* The new activation value of the child node, is the sum of the weights of each connection in the pool, multiplied by the activation value of the corresponding parent node.

##### undefined .learn(boolean correct)

One of the two public methods of NNModel, along with ```.predict(int[])```. The ```correct``` parameter should be ```false``` when the model should be changed, and ```true``` otherwise. This method updates the weights of all non-passive connections only if correct equals ```false```. If correct equals ```true```, this method will not have an effect.

The new weights of all non-passive connections are set as follows:

new weight = previous weight + (model's learning rate * parent node's activation value * child node's activation value)

This method also adds all weight changes to ```.weight_history``` (which is connection-specific), and neutralises all oldest weight changes in ```.weight_history``` that go over the ```weight_history_size``` of the model. This results in a 'memory-like' behaviour.

## Using HebbianJS in Your Projects

### In Short

* Load framework in HTML:
* Create a neural network per entity that's going to use one
* Give the NN input values, and receive an array with the outputs
* Tell the NN wheter it did a good job (stay the same) or not (change the weights)

### Load Framework

```<script language="JavaScript" src="HebbianJS.js"></script>```

### Create Neural Network

Every entity (for example; every robot) should have its own neural network. Please consult the developer's documentation above for descriptions of all the different options, variables and values.

```javascript
this.neuralNetwork = NNFramework.model({
  learning_rate: 0.000001,
  weight_history_size: Math.Infinity,
  input: 4,
  hidden: [2],
  output: 1,
  labels: {
    nodes: {
      '0.0': 'DR',
      '0.1': 'DL',
      '0.2': 'TR',
      '0.3': 'TL',
    },
    connections: {}
  },
  overrides: {
    '0.2.0': {
      'weight': 1
    },
    '0.2.1': {
      'weight': 1
    },
    '0.3.0': {
      'weight': 1
    },
    '0.3.1': {
      'weight': 1
    },
    '1.0.0': {
      'weight': 1
    },
    '1.1.0': {
      'weight': 1
    }
  }
});
```

### Get Predictions

The .predict() method requires an array as an input, that has the same length as the 'input' value you've set in the model. Here, DR, DL, TR and TL are sensor values.

It returns an array with the length of the 'output' value you've set in the model above.

Call this method in the robotMove loop.

```javascript
const NN_RESULTS = robot.neuralNetwork.predict([
  -(50 - DR), (50 - DL), -TR, TL
]);
const TORQUE = NN_RESULTS[0] * MAX_TORQUE;
```

### Teaching the Neural Network

The .learn() method requires a boolean. 'True' for 'everything is okay', 'false' for 'I don't want this'. Call this method each time you call the .predict() method, just after calling that method.

```javascript
robot.neuralNetwork.learn(!bTOUCHING_ANY);
```
