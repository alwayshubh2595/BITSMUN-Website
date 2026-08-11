import * as yup from 'yup'

const phoneRegex = /^[0-9]{10}$/;

const EBschema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    phone: yup.string().matches(phoneRegex, 'Phone number is not valid').required("Phone number is required"),
    committee1: yup.string().required("Choose a committee"),
    committee2: yup.string().required("Choose a committee").notOneOf([yup.ref('committee1')], 'Choose a different committee'),
    experience: yup.string().required("Enter the number of MUNs you have attended"),
    // Was a second `experience` key, which silently overwrote the first — object
    // literals keep the last duplicate — so this field was never validated.
    ebexperience: yup.string().required("Enter your experience as a member of an Executive Board"),
    // The resume input had no `required` attribute and no rule here, so an
    // application could be submitted with no resume at all.
    fileContent: yup.string().required("Upload your resume"),
})

export default EBschema
