import React, { useEffect } from 'react'
import styled from "styled-components"
import { ERROR, SUCCESS, IRootState, Status, PRICE_UPDATE_INTERVAL } from '../../Constants';
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { setAlertStatusCheck, setAlertStatusError, monitorAction } from "../../Actions"
import 'sweetalert/dist/sweetalert.css';
const { default: SweetAlert }: any = require('sweetalert-react');

interface IPassedProps {
    id: string
}

interface IOwnProps {
    status: Status,
    errorStatus: string,
    currencyId: string
}

const mapStateToProps = (state: IRootState, ownProps: IPassedProps): IOwnProps => {
    const { id } = ownProps;
    const content = state.alerts[id];
    const { status, currencyId } = content;
    const errorStatus = content.errors.status;
    return { status, errorStatus, currencyId }
}

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    monitor: monitorAction,
    setAlertStatus: (id: string, status: Status) => setAlertStatusCheck({ id, status }),
    setAlertStatusError: (id: string, status: Status, error: string) => setAlertStatusError({ id, status, error }),
}, dispatch);

interface IProps extends IOwnProps, IPassedProps {
    setAlertStatus: (id: string, status: Status) => void,
    setAlertStatusError: (id: string, status: Status, error: string) => void,
    monitor: (id: string, currencyId: string) => void,
}

const getColor = (status: Status): string => {
    if (status === Status.started) return ERROR;
    return SUCCESS
}

interface IStatus {
    status: Status
}

const StatusContainer = styled.div<IStatus>`
    width: 80px;
    height: 26px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => getColor(p.status)};
    transition: all ease-in-out .2s;
    cursor: pointer;
`

const StatusText = styled.p`
    font-size: 12px;
    letter-spacing: 2px;
    color: white;
    font-weight: bold;
    font-family: Open Sans;
`

const StatusButton: React.FC<IProps> = (
    { 
        id, 
        status, 
        currencyId,
        setAlertStatus, 
        setAlertStatusError, 
        errorStatus, 
        monitor
    }) => {
    const getText = (): string => {
        if(status === Status.started) return "STOP"
        return "START"
    }
    const getNextStatus = (): Status => {
        if(status === Status.started) return Status.stopped
        return Status.started
    }
    // check price every minute
    useEffect(() => {
        if(status === Status.started){
            const i = setInterval(() => monitor(id, currencyId), PRICE_UPDATE_INTERVAL);
            return () => clearInterval(i);
        }
    }, [status, id, currencyId, monitor])

    return (
        <>
            <StatusContainer onClick={() => setAlertStatus(id, getNextStatus())} status={status}>
                <StatusText>{getText()}</StatusText>
            </StatusContainer>
            <SweetAlert
                type="error"
                show={errorStatus.length > 0}
                title="Status Error"
                confirmButtonColor={SUCCESS}
                text={errorStatus}
                onConfirm={() => setAlertStatusError(id, Status.stopped, "")}
            />
        </>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatusButton);
