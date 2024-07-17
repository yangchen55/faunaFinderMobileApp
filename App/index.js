import React from "react"
import Navigation from "./config/Navigation"
import { RootSiblingParent } from 'react-native-root-siblings';




export default () =>
    <RootSiblingParent>
        <Navigation />
    </RootSiblingParent>