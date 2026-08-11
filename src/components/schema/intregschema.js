import * as yup from 'yup'

const phoneRegex = /^\+?\d{8,16}$/;

const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    // International numbers vary in length and carry a country code, so the old
    // bare 10-15 digit rule rejected anything written with a leading +.
    phone: yup.string().matches(phoneRegex, 'Phone number is not valid').required("Phone number is required"),
    institute: yup.string().required("Institute name is required").min(3, "Enter a valid institute name"),
    countryName: yup.string().required("Country is required"),
    mode: yup.string().required("Choose a mode of participation"),
    committee1: yup.string().required("Choose a committee"),
    committee2: yup.string().required("Choose a committee").notOneOf([yup.ref('committee1')], 'Choose a different committee'),
    experience: yup.string().required("Enter your experience"),
    // Reduced from three portfolio choices to two, matching the delegate form.
    portfolio1: yup.string().required("Enter your first choice of Portfolio"),
    portfolio2: yup.string().required("Enter your second choice of Portfolio"),
    fileContent: yup.string().required("Upload your payment screenshot"),
})

export default schema
