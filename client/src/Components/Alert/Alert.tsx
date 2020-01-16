import React, { useState } from 'react'
import styled from "styled-components"
import StatusButton from "../StatusButton"

import Select, { ActionMeta } from "react-select"
import CurrencySelector from "../CurrencySelector"

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { 
    deleteAlertAction, 
    setAlertStatusCheck, 
    setAlertAmount, 
    setAlertDuration, 
    setAlertPercentage, 
    setAlertCondition, 
    setAlertTimeframe 
} from "../../Actions"

import { IoIosPricetags } from "react-icons/io"
import { TiDelete } from "react-icons/ti"
import { 
    PRIMARY_1, 
    ERROR,     
    CONDITION_OPTIONS, 
    TIMEFRAME_OPTIONS,
    SUCCESS, 
    IRootState, 
    Status,
    UiObject, 
    ErrorLayout, 
    getSelectStyles
} from '../../Constants'


const Container = styled.div`
    width: 96%;
    display: flex;
    flex-wrap: wrap;
    border-radius: 10px;
    margin-bottom: 20px;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    transition: all ease-in-out 0.2s;
`
const Part = styled.div`
    flex: 1;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    transition: all ease-in-out 0.2s;
    @media only screen and (max-width: 660px) {
        flex-basis: 100%;
    }
`

interface ISelectable {
    isSelected: boolean,
}

const Title = styled.p<ISelectable>`
    font-size: 16px;
    letter-spacing: ${p => p.isSelected ? "3px" : "-1px"};
    font-family: mainMedium;
    margin-bottom: 20px;
    transition: all ease-in-out 0.2s;
`

const InputContainer = styled.div`
    height: 26px;
    width: 33%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-radius: 6px;
    border: 1px solid #ddd;
    padding: 6px;
    transition: all ease-in-out 0.2s;

`

const InputContainerSmall = styled.div`
    height: 26px;
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-radius: 6px;
    border: 1px solid #ddd;
    padding: 6px;
    transition: all ease-in-out 0.2s;

    @media only screen and (max-width: 900px) {
        width: 60px;
    }
    @media only screen and (max-width: 780px) {
        width: 40px;
    }
    @media only screen and (max-width: 660px) {
        width: 80px;
        font-size: 10px;
    }
`

const InputContainerSmaller = styled.div`
    height: 26px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-radius: 6px;
    border: 1px solid #ddd;
    padding: 6px;
    transition: all ease-in-out 0.2s;
    
    @media only screen and (max-width: 660px) {
        width: 60px;
    }
`

const SearchInput = styled.input`
    outline-width: 0;
    border: none;
    height: 30px;
    width: 70%;
    background: transparent;
    font-size: 14px;
    font-family: mainMedium;
    margin-left: 4px;
`

const MessageContainer = styled.div`
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 6px;
    padding-right: 6px;
    margin-top: 20px;
    transition: all ease-in-out 0.2s;
`

const CurrencyContainer = styled.div`
    width: 30%;
    height: 100%;
    border-radius: 10px 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: mainMedium;
    font-size: 14px;
    transition: all ease-in-out 0.2s;

    @media only screen and (max-width: 900px) {
        width: 30%;
        font-size: 12px;
    }
    @media only screen and (max-width: 780px) {
        width: 20%;
        font-size: 10px;
    }
`

const Message = styled.p`
    font-size: 14px;
    font-family: mainMedium;
    margin-left: 10px;    
    margin-right: 10px;   
    transition: all ease-in-out 0.2s;

    @media only screen and (max-width: 780px) {
        margin-left: 4px;    
        margin-right: 4px; 
    }
`

interface IVisible {
    isVisible: boolean,
}

const PercentageContainer = styled.div<IVisible>`
    height: 26px;
    width: 70%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    transition: all ease-in-out 0.2s;
    opacity: ${p => p.isVisible ? '1' : '0'};

    @media only screen and (max-width:1100px) {
        width: 90%;
    }
    @media only screen and (max-width:660px) {
        width: 80%;
        margin: 40px;
    }
`

const CircleContainer = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: ${PRIMARY_1};
    display: flex;
    align-items: center;
    justify-content: center;
`

interface IMetProps {
    isMet: boolean,
}

const AbsoluteBar = styled.div<IMetProps>`
    position: absolute;
    bottom: 0;
    width: 400px;
    left: calc(50% - 400/2);
    height: 14px;
    border-radius: 10px 10px 0 0; 
    transition: all ease-in-out 0.2s;

    @media only screen and (max-width:1100px) {
        width: 260px;
    }
    @media only screen and (max-width: 780px) {
        width: 200px;
    }
    @media only screen and (max-width: 660px) {
        width: 400px;
    }
` 

const DeleteContainer = styled.div`
    position: absolute;
    top: 10px;
    cursor: pointer;
    width: 24px;
    right: 10px;
    height: 24px;
    transition: all ease-in-out 0.2s;
    &:hover {
        transform: scale(1.1);
    }
`

interface IIndexable {
    indexSelected: number
}

const AbsoluteCursor = styled.div<IIndexable>`
    position: absolute;
    top: 0;
    width: 30px;
    left: ${p => `calc(${(p.indexSelected+1) * (100/3) - (100/6)}% - 15px)`};
    height: 6px;
    background: ${PRIMARY_1};
    border-radius: 0 0 4px 4px; 
    transition: all ease-in-out 0.2s;

    @media only screen and (max-width: 660px) {
        display: none;
    }
`

interface IPassedProps {
    id: string
}
interface IOwnProps {
    creationPrice: number,
    conditionValue: string,
    colorUi: UiObject,
    errors: ErrorLayout,
    statusValue: Status,
    isMet: boolean,
    percentageValue?: number,
    amountValue: number,
    durationValue?: number
}

const mapStateToProps = (state: IRootState, ownProps: IPassedProps): IOwnProps => {
    const { id } = ownProps;
    const { colorUi, alerts } = state;
    const { creationPrice, errors, condition, isMet, amount: amountValue, status: statusValue } = alerts[id];
    const { value: conditionValue, percentage: percentageValue, duration: durationValue } = condition;
    return { 
        creationPrice, 
        colorUi, 
        errors, 
        conditionValue,
        percentageValue,
        amountValue,
        durationValue,
        statusValue,
        isMet
    }
}

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    deleteAlert: (id: string) => deleteAlertAction(id),
    setAlertStatus: (id: string, status: Status)=> setAlertStatusCheck({ id, status }),
    updateAmount: (amount: string, id: string) => setAlertAmount({ amount, id }),
    updateCondition: (condition: string, id: string) => setAlertCondition({ condition, id }),
    updateTimeframe: (timeframe: string, id: string) => setAlertTimeframe({ timeframe, id }),
    updatePercentage: (percentage: string, id: string) => setAlertPercentage({ percentage, id }),
    updateDuration: (duration: string, id: string) => setAlertDuration({ duration, id }),
}, dispatch);

interface IProps extends IPassedProps, IOwnProps {
    deleteAlert: (id: string) => void,
    setAlertStatus: (id: string, status: Status) => void,
    updateAmount: (amount: string, id: string) => void,
    updateDuration: (duration: string, id: string) => void,
    updatePercentage: (percentage: string, id: string) => void,
    updateCondition: (condition: string, id: string) => void,
    updateTimeframe: (timeframe: string, id: string) => void
}


const Alert: React.FC<IProps> = (
    { 
        id, 
        colorUi, 
        creationPrice, 
        amountValue,
        statusValue,
        percentageValue, 
        durationValue,
        conditionValue,
        errors, 
        deleteAlert, 
        updateAmount, 
        updatePercentage,
        updateCondition,
        updateTimeframe,
        updateDuration,
        setAlertStatus,
        isMet
    }
    ) => {
    const initState = (value: number | undefined): string => {
        return (value === 0 || value === undefined) ? "" : value.toString();
    } 
    // state index
    const [indexSelected, setIndexSelected] = useState(1);
    const [amount, setAmount] = useState(initState(amountValue));
    const [percentage, setPercentage] = useState(initState(percentageValue));
    const [duration, setDuration] = useState(initState(durationValue));

    const customConditionStyles = getSelectStyles("10vw", colorUi);
    const customTimeframeStyles = getSelectStyles("6vw", colorUi);

    const updateLocalAmount = (): void => {
        updateAmount(amount, id);
        if(errors.amount && errors.amount.length > 0)
            setAmount('')
    }
    const updateLocalPercentage = (): void => {
        updatePercentage(percentage, id);
        if(errors.percentage && errors.percentage.length > 0)
            setPercentage('')
    }
    const updateLocalDuration = (): void => {
        updateDuration(duration, id);
        if(errors.duration && errors.duration.length > 0)
            setDuration('')
    }
    const statusDecorated = (target: Function, ...args: string[]) => {
        target(...args);
        if(statusValue !== Status.stopped)
            setAlertStatus(id, Status.stopped)
    }
    const getBarColor = (): string => {
        if(statusValue === Status.stopped)
            return colorUi.background
        else
            return isMet ? SUCCESS : ERROR;
    }

    const renderFirstPart = () => (
        <Part style={{background: indexSelected === 0 ? `radial-gradient(ellipse at top, ${colorUi.tint}, transparent 50%)` : ""}} onClick={() => setIndexSelected(0)}>
            <Title style={{color: colorUi.opposite}} isSelected={indexSelected === 0}>
                CURRENCY
            </Title>
            <CurrencySelector statusDecorator={statusDecorated} id={id}/>
            <MessageContainer>
                <CircleContainer>
                    <IoIosPricetags color="yellow" size={18} />
                </CircleContainer>
                <Message style={{color: colorUi.opposite}}>
                    {`Current Price: ${creationPrice} USD`}
                </Message>
            </MessageContainer>
        </Part>
    );

    const renderSecondPart = () => (
        <Part style={{background: indexSelected === 1 ? `radial-gradient(ellipse at top, ${colorUi.tint}, transparent 50%)` : ""}} onClick={() => setIndexSelected(1)}>
            <Title style={{color: colorUi.opposite}} isSelected={indexSelected === 1}>AMOUNT</Title>
            <InputContainer style={{background: colorUi.background}}>
                <CurrencyContainer style={{background: colorUi.shade, color: colorUi.opposite}}>
                    USD
                </CurrencyContainer>
                <SearchInput 
                    value={amount}
                    disabled={conditionValue !== "Above" && conditionValue !== "Below"}
                    placeholder="1000.0" 
                    style={{color: colorUi.opposite}}
                    onBlur={() => updateLocalAmount()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => statusDecorated(setAmount, e.target.value)} 
                    type="text" 
                />
            </InputContainer>
            <MessageContainer>
                <StatusButton id={id}/>
            </MessageContainer>
        </Part>
    );

    const renderThirdPart = () => (
        <Part style={{background: indexSelected === 2 ? `radial-gradient(ellipse at top, ${colorUi.tint}, transparent 50%)` : ""}} onClick={() => setIndexSelected(2)}>
            <Title style={{color: colorUi.opposite}} isSelected={indexSelected === 2}>CONDITION</Title>
            <Select 
                options={CONDITION_OPTIONS}
                onChange={(value: any, { action }: ActionMeta) => statusDecorated(updateCondition, value.value, id)}
                defaultValue={{ value: conditionValue, label: conditionValue }}
                styles={customConditionStyles}
            >
            </Select>
            <PercentageContainer isVisible={conditionValue !== "Above" && conditionValue !== "Below"}>
                <InputContainerSmall style={{background: colorUi.background}}>
                    <CurrencyContainer style={{background: colorUi.shade, color: colorUi.opposite}}>
                        %
                    </CurrencyContainer>
                    <SearchInput 
                        style={{color: colorUi.opposite}}
                        value={percentage}
                        onBlur={() => updateLocalPercentage()}
                        placeholder="100.0" 
                        type="text" 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => statusDecorated(setPercentage, e.target.value)}
                    />
                </InputContainerSmall>
                <Message style={{color: colorUi.opposite}}>in</Message>
                <InputContainerSmaller style={{background: colorUi.background}}>
                    <SearchInput 
                        placeholder="10" 
                        value={duration}
                        style={{color: colorUi.opposite, marginLeft: 0, width: "100%"}}
                        onBlur={() => updateLocalDuration()}
                        type="text" 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => statusDecorated(setDuration, e.target.value)}
                    />
                </InputContainerSmaller>
                <Select
                    defaultValue={TIMEFRAME_OPTIONS[0]}
                    onChange={(value: any, { action }: ActionMeta) => statusDecorated(updateTimeframe, value.value, id)}
                    styles={customTimeframeStyles}
                    options={TIMEFRAME_OPTIONS}
                >
                </Select>
            </PercentageContainer>
        </Part>
    );

    const renderDelete = () => (
        <DeleteContainer onClick={() => deleteAlert(id)}>
            <TiDelete color={ERROR} size={24} />
        </DeleteContainer>
    )

    return (
        <Container style={{background: colorUi.main, boxShadow: `6px 6px 12px ${colorUi.shade}`}}>
            <AbsoluteCursor indexSelected={indexSelected} />
            {renderDelete()}
            {renderFirstPart()}
            {renderSecondPart()}
            {renderThirdPart()}
            <AbsoluteBar 
                style={{background: getBarColor()}}
                isMet={false} 
            />
        </Container>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Alert);
