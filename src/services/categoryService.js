import api from "./api";

export const getCustomerCategories = async () =>{
    const response = await api.get('/customer/categories')

    return response.data
}

export const getCustomerCategory = async (id) =>{
    const response = await api.get(`/customer/categories/${id}`)

    return response.data
}