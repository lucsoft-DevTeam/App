import React from 'react';
import root from 'react-shadow';
import Demo from '../menu/view';
export class HomeSYS extends React.Component<{}, {}> {

    render() {
        return (<div id="root">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            <Demo name="HomeSYS"></Demo>
            <p>Hello</p></div>
        )
    }
}