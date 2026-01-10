const prom = new Promise((res) => {
    setTimeout(() => {
        res(123)
    }, 100)
})

const res = await prom;
export default res;