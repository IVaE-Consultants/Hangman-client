/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import * as React from 'react';
const {Effect} = require('effectjs');
import {init, update, view} from './components/app';

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
        application.onStart((initialView : any) => {
            this.setState({view: initialView});
        });
        application.onView((view : any) => {
            this.setState({view});
        });
        application.start();
    },
    render() {
        return this.state.view;
    },
});

AppRegistry.registerComponent('hangmanclient', () => hangmanclient);
