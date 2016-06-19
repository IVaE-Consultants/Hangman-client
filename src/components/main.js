"use strict";
var React = require('react');
var _a = require('effectjs'), Action = _a.Action, Effect = _a.Effect, Result = _a.Result;
var react_native_1 = require('react-native');
exports.init = function () {
    return Result({}, Effect.none);
};
exports.update = function (state, action) {
    var type = action.type, data = action.data;
};
exports.view = function (state, next) {
    return (React.createElement(react_native_1.TouchableHighlight, {onPress: function () { console.log("Ho yeah"); next(Action('page', { page: '/guess' })); }}, React.createElement(react_native_1.View, {style: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: 250,
        height: 150,
        backgroundColor: 'green'
    }}, React.createElement(react_native_1.Text, null, "This is main view"))));
};
