import React from 'react';
import styled from "styled-components";
import { Header, AlertContent } from "../"
import { connect } from "react-redux"
import { IRootState, UiObject } from '../../Constants';

const Wrapper = styled.div`
  width: 96vw;
  min-height: 100vh;
  padding: 2vw;
  transition: all ease-in-out 0.2s;

`

const MainMessage = styled.h1`
  font-family: Open Sans;
  font-size: 30px;
  margin-left: 24px;
  transition: all ease-in-out 0.2s;
  @media only screen and (max-width: 600px) {
    font-size: 24px;
  }
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
        <MainMessage style={{color: colorUi.opposite}}>
          Your Alerts
        </MainMessage>
        <AlertContent />
    </Wrapper> 
);}

export default connect(
  mapStateToProps,
)(AppWrapper);