import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DeleteToken } from "./Localstorage";
import { GetToken } from "./Localstorage";

const navigate = useNavigate()
const { access, refresh } = GetToken()



function validity() {
    axios.post('http://localhost:8000/api/user/token/verify/', { token: access })
        .then((resp) => {
            if (resp) {
                if (Object.keys(resp.data).length === 0) {
                    console.log('Verification Successful')
                }
                else {
                    console.log('Verification Failed')
                }
            }
        })
        .catch((err) => {
            console.log(err.response.data.detail);
            console.log(err.response.data.code);
            console.log("Bye")
            DeleteToken();
            navigate('/login')
        }
        )
}


function refresh_token() {
    axios.post('http://localhost:8000/api/user/token/update/', { refresh: refresh })
        .then((resp) => {
            console.log(resp.data.access)
            localStorage.setItem('access_token', resp.data.access)
        })
        .catch((err) => {
            console.log(err);
        }
        )

}

export { validity, refresh_token }