/*
 * HebbianJS
 * Copyright (C) 2017  Ysbrand van Eijck
 *
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

var NNFramework = {
  NNNode: function(layer_index, node_index) {
    var obj = this;

    obj.layer_index;
    obj.node_index;
    obj.activation;
    obj.label;

    obj._init = function(layer_index, node_index) {
      obj.layer_index = layer_index;
      obj.node_index = node_index;
      obj.activation = 0;
      obj.label = null;

      return obj;
    }

    return obj._init(layer_index, node_index);
  },

  NNConnection: function(from_layer, from_node, to_node) {
    var obj = this;

    obj.from_layer;
    obj.from_node;
    obj.to_layer;
    obj.to_node;
    obj.weight;
    obj.passive;
    obj.weight_history;
    obj.label;

    obj._init = function(from_layer, from_node, to_node) {
      obj.from_layer = from_layer;
      obj.from_node = from_node;
      obj.to_layer = from_layer + 1;
      obj.to_node = to_node;
      obj.weight = 0;
      obj.passive = false;
      obj.weight_history = [];
      obj.label = null;

      return obj;
    }

    return obj._init(from_layer, from_node, to_node);
  },

  NNModel: function(model) {
    var obj = this;

    obj.learning_rate;
    obj.nodes;
    obj.connections;

    obj._init = function(model) {
      obj.learning_rate = model.learning_rate;
      obj.weight_history_size = model.weight_history_size;

      obj._generateNodes(model.input, model.hidden, model.output);
      obj._generateConnections();
      if (model.labels !== undefined) {
        obj._setLabels(model.labels);
      }
      if (model.overrides !== undefined) {
        obj._handleOverrides(model.overrides);
      }
      return obj;
    }

    obj._numberOfLayers = function() {
      return obj.nodes.length;
    }

    obj._numberOfNodes = function(layer) {
      return obj.nodes[layer].length;
    }

    obj._generateNodes = function(input, hidden, output) {
      obj.nodes = [];

      // Create input nodes
      var input_layer = [];
      for (var i = 0; i < input; i++) {
        input_layer.push(new NNFramework.NNNode(0, i));
      }
      obj.nodes.push(input_layer);

      // Create hidden nodes
      for (var hidden_layer_index = 0; hidden_layer_index < hidden.length; hidden_layer_index++) {
        var hidden_layer = [];
        for (var i = 0; i < hidden[hidden_layer_index]; i++) {
          hidden_layer.push(new NNFramework.NNNode(1 + hidden_layer_index, i));
        }
        obj.nodes.push(hidden_layer);
      }

      // Create output nodes
      var output_layer = [];
      for (var i = 0; i < output; i++) {
        output_layer.push(new NNFramework.NNNode(1 + hidden.length, i));
      }
      obj.nodes.push(output_layer);
    }

    obj._generateConnections = function() {
      obj.connections = [];

      for (var parent_layer_index = 0; parent_layer_index < obj.nodes.length - 1; parent_layer_index++) {
        var connection_layer = [];
        for (var parent_node_index = 0; parent_node_index < obj.nodes[parent_layer_index].length; parent_node_index++) {
          for (var child_node_index = 0; child_node_index < obj.nodes[parent_layer_index + 1].length; child_node_index++) {
            connection_layer.push(new NNFramework.NNConnection(parent_layer_index, parent_node_index, child_node_index));
          }
        }
        obj.connections.push(connection_layer);
      }
    }

    obj._handleOverrides = function(overrides) {
      Object.keys(overrides).forEach(function(key) {
        const split = key.split(".");
        const parent_layer_index = parseInt(split[0]);
        const parent_node_index = parseInt(split[1]);
        const child_node_index = parseInt(split[2]);

        const connection_index = (parent_node_index * obj._numberOfNodes(parent_layer_index + 1)) + child_node_index;

        const weight = overrides[key]["weight"];
        if (weight !== undefined) {
          obj.connections[parent_layer_index][connection_index].weight = weight;
        }

        const passive = overrides[key]["passive"];
        if (passive !== undefined) {
          obj.connections[parent_layer_index][connection_index].passive = passive;
        }
      });
    }

    obj._getNode = function(name) {
      for (i = 0; i < obj.nodes.length; i++) {
        for (j = 0; j < obj.nodes[i].length; j++) {
          if (obj.nodes[i][j].label == name) {
            return obj.nodes[i][j];
          }
        }
      }
    }

    obj._getConnection = function(name) {
      for (i = 0; i < obj.connections.length; i++) {
        for (j = 0; j < obj.connections[i].length; j++) {
          if (obj.connections[i][j].label == name) {
            return obj.connections[i][j];
          }
        }
      }
    }

    obj._setLabels = function(labels) {
      if (labels["nodes"] !== undefined) {
        Object.keys(labels["nodes"]).forEach(function(n) {
          const s = n.split(".");
          obj.nodes[s[0]][s[1]].label = labels["nodes"][n];
        })
      }
      if (labels["connections"] !== undefined) {
        Object.keys(labels["connections"]).forEach(function(n) {
          const s = n.split(".");
          obj.connections[s[0]][s[1]].label = labels["connections"][n];
        })
      }
    }

    obj.predict = function(inputs) {
      // Input
      for (var i = 0; i < obj._numberOfNodes(0); i++) {
        obj.nodes[0][i].activation = inputs[i];
      }

      // Hidden and output layers
      for (var layer_index = 1; layer_index < obj._numberOfLayers(); layer_index++) {
        obj.nodes[layer_index].forEach(function(node) {
          var sum = 0;
          for (var parent_node_index = 0; parent_node_index < obj._numberOfNodes(layer_index - 1); parent_node_index++) {
            const connection = obj.connections[layer_index - 1][(parent_node_index * obj.nodes[layer_index].length) + node.node_index];
            if (!connection.passive) {
              sum += (obj.nodes[layer_index - 1][parent_node_index].activation * connection.weight);
            }
          }
          node.activation = sum;
        });
      }

      var prediction = [];
      for (var i = 0; i < obj._numberOfNodes(obj._numberOfLayers() - 1); i++) {
        prediction.push(obj.nodes[obj._numberOfLayers() - 1][i].activation);
      }
      return prediction;
    }

    obj.learn = function(correct) {
      if (!correct) {
        obj.connections.forEach(function(layer) {
          layer.forEach(function(connection) {
            if (!connection.passive) {
              const prev_weight = connection.weight;
              connection.weight = connection.weight + (obj.learning_rate * obj.nodes[connection.from_layer][connection.from_node].activation * obj.nodes[connection.to_layer][connection.to_node].activation);
              connection.weight_history.push(connection.weight - prev_weight);
              if (connection.weight_history.length > obj.weight_history_size) {
                connection.weight -= connection.weight_history.shift();
              }
            }
          });
        });
      }
      // TODO: make check if anything has changed (significantly), and return that
      return undefined;
    }

    return obj._init(model);
  },

  model: function(model) {
    return new NNFramework.NNModel(model);
  }
};

if (window !== undefined) {
  window.NNFramework = NNFramework;
}
