import React, { useEffect, ReactElement } from 'react'
import styled from "styled-components"
import { PRIMARY_2, IAlert, IRootState, ObjectLayout } from "../../Constants"
import { connect } from "react-redux"
import { bindActionCreators, Dispatch } from "redux"
import { fetchAlertsAction, createAlertAction, fetchCurrenciesAction } from "../../Actions"

import Alert from "../Alert"

interface IOwnProps {
    errors: object, 
    alerts: ObjectLayout,
    isFetching: boolean,
}

const mapStateToProps = (state: IRootState): IOwnProps => ({
    errors: state.errors,
    alerts: state.alerts,
    isFetching: state.isFetching,
})

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  createAlert: createAlertAction,
  fetchAlerts: fetchAlertsAction,
  fetchCurrencies: fetchCurrenciesAction
}, dispatch);

const Container = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
`

const CreateText = styled.div`
    font-size: 14px;
    color: white;   
    font-family: mainBold;
    letter-spacing: 0.2em;
    letter-spacing: 1px;
    transition: all ease-in-out 0.2s;

    @media only screen and (max-width: 500px) {
        font-size: 12px;
    }
`

const CreateButton = styled.div`
    width: 160px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${PRIMARY_2};
    border-radius: 6px;
    cursor: pointer;

    &:hover ${CreateText} {
        letter-spacing: 3px;
    }

    @media only screen and (max-width: 500px) {
        width: 120px;
        height: 38px;
    }
`
interface IProps extends IOwnProps {  
    createAlert: () => (dispatch: any) => void,
    fetchAlerts: () => (dispatch: any) => void,
    fetchCurrencies: () => (dispatch: any) => void,
}

const AlertContent: React.FC<IProps> = (
    {   createAlert, 
        fetchAlerts, 
        fetchCurrencies, 
        errors, 
        isFetching, 
        alerts
    }) => {
    // fetch alerts on mount
    useEffect(() => {
        fetchAlerts();
        fetchCurrencies();
    }, [fetchAlerts, fetchCurrencies]);

    const renderAlerts = (): ReactElement => {
        const alertArr = Object.values(alerts || {});
        return( 
            <>
                {alertArr.map((a: IAlert) => <Alert key={a._id} id={a._id} />)}
            </>
        );
    }

    return (
        <Container>
            {!isFetching && renderAlerts()}
            <CreateButton onClick={() => createAlert()}>
                <CreateText>CREATE ALERT</CreateText>
            </CreateButton>
        </Container>
    )
}

export default connect(
    mapStateToProps, 
    mapDispatchToProps
)(AlertContent);
