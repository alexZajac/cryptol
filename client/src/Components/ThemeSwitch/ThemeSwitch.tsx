import React from 'react'
import styled from "styled-components"
import { connect } from "react-redux"
import { IRootState } from "../../Constants"
import { setSwitch } from "../../Actions"
import { Dispatch } from 'redux'

interface IOwnProps {
    isLight: boolean
}

const RoundedBackground = styled.div<IOwnProps>`
    background: ${p => p.isLight ? "black" : "#222C49"};
    width: 46px;
    height: 24px;
    cursor: pointer;
    border-radius: 30px;
    position: relative;
    transition: all ease-in-out 0.2s;
    margin: 20px;
`
const Disk = styled.div<IOwnProps>`
    background: ${p => p.isLight ? "white" : "transparent"};
    position: absolute;
    top: 3px;
    left: ${p => p.isLight ? "3px" : "calc(100% - 3px - 18px)"};
    box-shadow: ${p => p.isLight ? "" : "inset -6px -3px 1px 0 #f3d076"};
    height: 18px;
    width: 18px;
    border-radius: 50%;
    transition: all ease-in-out 0.2s;
`

const mapStateToProps = (state: IRootState): IOwnProps => ({
    isLight: state.isLight
})

const mapDispatchToProps = (dispatch: any) => ({
    toggle: () => dispatch(setSwitch()),
});

interface IProps extends IOwnProps {
    toggle: () => (dispatch: Dispatch) => void
}

const ThemeSwitch: React.FC<IProps> = ({ isLight, toggle }) => {
    return (
        <>
            <RoundedBackground onClick={() => toggle()} isLight={isLight}>
                <Disk isLight={isLight} />
            </RoundedBackground>
        </>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ThemeSwitch);
