import React, { useState } from 'react'
import { IRootState, UiObject, SUCCESS } from '../../Constants';
import { connect } from "react-redux"
import { bindActionCreators } from 'redux';
import { setEmail } from "../../Actions"
import styled from "styled-components"
import 'sweetalert/dist/sweetalert.css';
const { default: SweetAlert }: any = require('sweetalert-react');

const Container = styled.div`
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
`

const MainMessage = styled.h1`
  font-family: mainBold;
  font-size: 30px;
  margin-left: 24px;
  margin-right: 24px;
  transition: all ease-in-out 0.2s;
  @media only screen and (max-width: 600px) {
    font-size: 24px;
  }
  @media only screen and (max-width: 500px) {
    font-size: 18px;
    margin-right: 12px;
  }
`

const InputContainer = styled.div`
    height: 26px;
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 10px;
    margin-right: 24px;

    @media only screen and (max-width: 520px) {
        width: 140px;
        margin-right: 12px;
        height: 20px;
    }
`

const SearchInput = styled.input`
    outline-width: 0;
    border: none;
    height: 100%;
    width: 100%;
    background: transparent;
    font-size: 14px;
    font-family: mainMedium;
    transition: all ease-in-out .2s;

    @media only screen and (max-width: 520px) {
        font-size: 10px
    }
`

const StatusContainer = styled.div`
    width: 60px;
    height: 26px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${SUCCESS};
    transition: all ease-in-out .2s;
    cursor: pointer;
`

const StatusText = styled.p`
    font-size: 14px;
    letter-spacing: 2px;
    color: white;
    font-weight: bold;
    font-family: mainBold;
`

interface IOwnProps {
    email: string,
    colorUi: UiObject
}

const mapStateToProps = (state: IRootState): IOwnProps => ({
    email: state.email,
    colorUi: state.colorUi
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    setEmail: (email: string) => setEmail({ email })
}, dispatch);

interface IProps extends IOwnProps {
    setEmail: (email: string) => void
}

const EmailHeader: React.FC<IProps> = ({ colorUi, email, setEmail }) => {
    const [emailLocal, setEmailLocal] = useState(email);
    const [showAlert, setShowAlert] = useState(false);

    const getTypeAlert = (): string => emailLocal.length === 0 ? "error" : "success"
    const getTextAlert = (): string => emailLocal.length === 0 ? "Cannot set empty email!" : "Your email was set successfully!"

    return (
        <Container>
            <MainMessage style={{color: colorUi.opposite}}>
                Your Alerts
            </MainMessage>
            <InputContainer style={{background: colorUi.main}}>
                <SearchInput 
                    value={emailLocal}
                    placeholder="example@sendmeupdates.com" 
                    style={{color: colorUi.opposite}}
                    onBlur={() => setEmail(emailLocal)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailLocal(e.target.value)} 
                    type="text" 
                />
            </InputContainer>
            <StatusContainer onClick={() => setShowAlert(true)}>
                <StatusText>OK</StatusText>
            </StatusContainer>
            <SweetAlert
                type={getTypeAlert()}
                show={showAlert}
                title="Email"
                confirmButtonColor={SUCCESS}
                text={getTextAlert()}
                onConfirm={() => setShowAlert(false)}
            />
        </Container>

    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps)
(EmailHeader);
