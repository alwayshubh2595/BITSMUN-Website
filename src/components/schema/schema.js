import * as yup from 'yup';

const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    age: yup.number().required("Age is required").positive("Enter a valid age").integer("Enter a valid age").min(12, "Age should be greater than 12"),
    phone: yup.string().required("Phone number is required").test(
        'is-valid-phone',
        function (value) {
            if (!value.startsWith('+91')) {
                return this.createError({ message: 'Phone number must start with +91' });
            }
            if (value.length !== 13) {
                return this.createError({ message: 'Phone number must be 13 characters long including +91' });
            }
            return true;
        }
    ),
    institute: yup.string().required("Institute name is required").min(3, "Enter a valid institute name"),
    mode: yup.string().required("Choose a mode of participation"),
    committee1: yup.string().required("Choose a committee"),
    committee2: yup.string().required("Choose a committee").notOneOf([yup.ref('committee1')], 'Choose a different committee'),
    experience: yup.string().required("Enter your experience"),
    portfolio: yup.string().required("Enter your choices of Portfolio"),
});

export default schema;