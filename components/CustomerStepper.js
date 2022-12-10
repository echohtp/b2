import { Stepper } from "react-form-stepper";

const CustomStepper = (props) => {
    return <Stepper steps={props.steps} styleConfig={{activeBgColor: "#F59E0B", completedBgColor: "#D97706", inactiveBgColor: "#000000"}} activeStep={props.activeStep | 0} />;
  };
   
  export default CustomStepper;