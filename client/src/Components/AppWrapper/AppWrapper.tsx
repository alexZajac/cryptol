import React from 'react';
import styled from "styled-components";
import { Header, AlertContent, EmailHeader } from "../"
import { connect } from "react-redux"
import { IRootState, UiObject } from '../../Constants';

const Wrapper = styled.div`
  width: 96vw;
  min-height: 100vh;
  padding: 2vw;
  transition: all ease-in-out 0.2s;
`

const mapStateToProps = (state: IRootState) => ({
  colorUi: state.colorUi
})

interface IProps {
  colorUi: UiObject
}

const AppWrapper: React.FC<IProps> = ({ colorUi }) => {
    return(
    <Wrapper style={{background: colorUi.background}}>
        <Header />
        <EmailHeader />
        <AlertContent />
    </Wrapper> 
);}

export default connect(
  mapStateToProps,
)(AppWrapper);