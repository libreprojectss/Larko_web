const StoreTkn = () => {
        localStorage.setItem('count', 1)
}

const StoreBusinessProfile =(value)=>{
    localStorage.setItem('business_profile',value)
}
const GetBp = () => {
    let profile = localStorage.getItem('business_profile');
    return profile;
}
const DeleteBp = () => {
    localStorage.removeItem('business_profile');
}
const GetTkn = () => {

    const count = localStorage.getItem('count')

    return { count }

}
const DeleteTkn = () => {

    localStorage.removeItem('count')

}
export { StoreTkn, GetTkn, DeleteTkn, StoreBusinessProfile, GetBp, DeleteBp }