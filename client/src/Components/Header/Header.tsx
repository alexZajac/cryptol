import React from 'react'
import styled from "styled-components";

import ThemeSwitch from "../ThemeSwitch"
import lightlogo from "../../Assets/logo_black.png"
import darklogo from "../../Assets/logo_white.png"

import { connect } from "react-redux"
import { IRootState, UiObject } from '../../Constants';

const Container = styled.div`
    flex: 1;
    display: flex;
    width: 100%;
    flex-direction: row;
`
const Part = styled.div`
    flex: 1;
    height: 15vh;
    display: flex;
    align-items: center; 
`
const Logo = styled.img`
    width: 220px;
    margin-left: 24px;
    height: auto;

    @media only screen and (max-width: 600px) {
        width: 160px;
    }
` 

interface IOwnProps {
    isLight: boolean,
    colorUi: UiObject
}

const mapStateToProps = (state: IRootState): IOwnProps => ({
    isLight: state.isLight,
    colorUi: state.colorUi
})

const Header: React.FC<IOwnProps> = ({ isLight, colorUi }) => {
    return (
        <Container>
            <Part style={{justifyContent: "flex-start"}}>
                <Logo alt="Logo app" src={isLight ? lightlogo : darklogo} />
            </Part>
            <Part style={{justifyContent: "flex-end"}}>
                <ThemeSwitch />
            </Part>
        </Container>
    )
}

export default connect(
    mapStateToProps,
)(Header);
