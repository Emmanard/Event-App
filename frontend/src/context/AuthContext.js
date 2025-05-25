import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { getUser } from 'services/auth';
const AuthContext = createContext()

const initialState = { isAuthenticated: false, user: {} }

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "SET_LOGGED_IN":
      return { ...state, isAuthenticated: true, user: payload.user }
    case "SET_LOGGED_OUT":
      localStorage.removeItem("jwtoken");
      localStorage.removeItem("user");
      return initialState
    default:
      return state
  }
}


export default function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toggle, setToggle] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {

    if (localStorage.jwtoken) {
      let user = jwtDecode(localStorage.jwtoken);
      const expiryDate = user.exp;
      const expiryDateMoment = moment.unix(expiryDate);
      const currentDate = moment();
      if (expiryDateMoment.isBefore(currentDate)) {
        dispatch({ type: "SET_LOGGED_OUT" });
        navigate("/auth/login")
      } else {
        getData()

      }
    } else {
      dispatch({ type: "SET_LOGGED_OUT" });
    }
  }, [toggle])


  const getData = async () => {
    try {
      let { data } = await getUser();
      dispatch({ type: "SET_LOGGED_IN", payload: { user: data?.data } })

    } catch (error) {
      let msg = "Some error occured";
      console.log(error);
      let { status, data } = error.response;
      if (status == 400 || status == 401 || status == 500) {
        msg = data.message;
        window.toastify(msg, "error");
      }
    }
  }


  return (
    <AuthContext.Provider value={{ ...state, dispatch, setToggle, toggle }}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuthContext = () => {
  return useContext(AuthContext)
}
