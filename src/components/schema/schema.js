import * as yup from 'yup';

const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    phone: yup.string().required("Phone number is required").test(
        'is-valid-phone',
        function (value) {
            if (!value || !value.startsWith('+91')) {
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
    // Split from a single `portfolio` field into two ranked preferences.
    portfolio1: yup.string().required("Enter your first choice of Portfolio"),
    portfolio2: yup.string().required("Enter your second choice of Portfolio"),
    // Was validated only by an ad-hoc check in onSubmit, which ran after the
    // rest of the form had already passed.
    fileContent: yup.string().required("Upload your payment screenshot"),
});

export default schema;
