import React, { useState } from 'react'

import AsyncSelect from 'react-select/async';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateCurrencyId, updateCurencyName, updateCurrencyError, getCreationPriceAction } from "../../Actions"

import { SUCCESS,  IRootState, UiObject, ICurrency, getSelectStyles } from '../../Constants'
import { InputActionMeta, ActionMeta } from 'react-select';

import 'sweetalert/dist/sweetalert.css';
const { default: SweetAlert }: any = require('sweetalert-react');

interface IPassedProps {
    id: string,
    statusDecorator: (target: Function, ...args: any []) => void
}

interface IOwnProps {
    currencies: Array<ICurrency>,
    colorUi: UiObject,
    currency: string,
    currencyError: string,
}

const mapStateToProps = (state: IRootState, ownProps: IPassedProps): IOwnProps => ({
    currencies: state.currencies,
    colorUi: state.colorUi,
    currency: state.alerts[ownProps.id].currency,
    currencyError: state.alerts[ownProps.id].errors.creationPrice,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    getCreationPrice: getCreationPriceAction,
    updateCurrencyName: (id: string, currency: string) => updateCurencyName({ id, currency }),
    updateCurrencyId: (id: string, currencyId: string) => updateCurrencyId({ id, currencyId }),
    updateCurrencyError: (id: string, currency: string, error: string) => updateCurrencyError({ id, currency, error })
}, dispatch);

interface IProps extends IOwnProps, IPassedProps {
    getCreationPrice: (id: string, currencyId: string) => void,
    updateCurrencyName: (id: string, name: string) => void,
    updateCurrencyId: (id: string, currencyId: string) => void,
    updateCurrencyError: (id: string, currency: string, error: string) => void
}

const CurrencySelector: React.FC<IProps> = (
    { 
        currencies, 
        currency,
        updateCurrencyId,
        updateCurrencyName, 
        id, 
        colorUi,
        statusDecorator,
        currencyError,
        getCreationPrice,
        updateCurrencyError,
    }) => {

    const [inputValue, setInputValue] = useState(currency);
    const customStyles = getSelectStyles("12vw", colorUi);

    const filterCurrencies = (): Array<ICurrency> => {
        if(inputValue.length < 3)
            return []
        return currencies
        .filter(
            (c: ICurrency) => c.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map(
            (c: ICurrency) => ({ ...c, value: c.name, label: c.name })
        );
    }

    const loadOptions = (_: string, callback: any) => callback(filterCurrencies());

    const handleInputChange = (newValue: string, action: string): string => {
        if(action !== "menu-close" && action !== "input-blur")
            setInputValue(newValue);
        return newValue;
    }

    const handleSelect = (selected: any, action: string) => {
        const { name, asset_id } = selected;
        updateCurrencyName(id, name);
        updateCurrencyId(id, asset_id);
        getCreationPrice(id, asset_id);
    }

    const getNoOptionsMessage = (inputValue: string): string => {
        const n = inputValue.length;
        if (n > 3)
            return "Coin not found, try another one!"
        return `Type ${3-n} more letters`;
    }

    return (
        <>
            <AsyncSelect 
                cacheOptions
                defaultOptions
                onChange={(value: any, { action }: ActionMeta) => statusDecorator(handleSelect, value, action)}
                noOptionsMessage={({ inputValue }: any) => getNoOptionsMessage(inputValue)}
                loadOptions={loadOptions}
                inputValue={inputValue}
                placeholder="Bitcoin"
                styles={customStyles}
                onBlur={() => setInputValue("")}
                onInputChange={
                    (newValue: string, { action }: InputActionMeta) => handleInputChange(newValue, action)}
            />
            <SweetAlert
                type="error"
                show={currencyError.length > 0}
                title="Currency Error"
                text={currencyError}
                confirmButtonColor={SUCCESS}
                onConfirm={() => updateCurrencyError(id, "", "")}
            />
        </>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CurrencySelector);
