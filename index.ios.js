/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {Effect} from 'effectjs';
import {init, update, view} from './components/app.js';

import {
  AppRegistry,
} from 'react-native';


const application = Effect.app({init, update, view});

const hangmanclient = React.createClass({
    getInitialState() {
        return {
            view: null,
        };
    },
    componentDidMount() {
        application.onStart(initialView => {
            this.setState({view: initialView});
        });
        application.onView(view => {
            this.setState({view});
        });
        application.start();
    },
    render() {
        return this.state.view;
    },
});

AppRegistry.registerComponent('hangmanclient', () => hangmanclient);
