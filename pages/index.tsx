import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'

//css
import "bootstrap/dist/css/bootstrap.css"

const Home: NextPage = () => {
  //form handlers
  const [form, setForm] = useState<{amount: number, term: number, interest: number}>({
    amount: 0,
    term: 0,
    interest: 0
  })

  //event listener for form
  const formHandler = (e:any) => {
    e.preventDefault();

    //set target in form handler
    setForm({
      ...form,
      [e.target.name]: parseInt(e.target.value)
    });
  }

  return (
    <div className='d-flex flex-column align-items-center py-5'>
      <Head>
        <title>Ammortization Tab</title>
      </Head>
      <form className='p-4 border mb-5' style={{width: "500px"}}>
        <h2 className='text-center'>Ammortization Calculator</h2>
        <div className='form-group position-relative'>
          <label htmlFor='amount'>Loan Amount:</label>
          <input className='form-control px-4' name='amount' value={form.amount} type="number" onChange={formHandler} min={0} />
          <span className='position-absolute top-50 text-secondary' style={{left: 10}}>$</span>
        </div>
        <div className='form-group'>
          <label>Term:</label>
          <input className='form-control' name='term' value={form.term} type="number" onChange={formHandler} min={0}  />
        </div>
        <div className='form-group'>
          <label>Interest:</label>
          <input className='form-control' name='interest' value={form.interest} type="number" onChange={formHandler} min={0}  />
        </div>
      </form>
      <div>
        <Table form={form} />
      </div>
    </div>
  )
}

interface TableProps {
  form: {
    amount: number
    term: number,
    interest: number
  }
}

const Table:React.FC<TableProps> = ({ form }) => {

  const [rowInfo, setRowInfo] = useState<any>(null);

  //calculation logic
  useEffect(() => {
    if (form.amount && (form.term && form.interest)) {
      const pd = paymentDue(form.amount, form.interest, form.term);

      let list:any = [];
      
      for (let i = 0; i < form.term * 12; i++) {
        if (i === 0) {
          list = [calculateMonth(form.amount, form.interest, pd)];
        } else {
          list = [...list, calculateMonth(list[i - 1].endingBalance, form.interest, pd)];
        }
      }
      console.log(list)
      setRowInfo(list)
    }
  }, [form])

  if (!form.amount || (!form.term || !form.interest)) return (null);

  return (
    <table className="table" onClick={() => {console.log(rowInfo)}}>
      <thead className='thead-dark'>
        <tr>
          <th className='px-4' scope='col'>#</th>
          <th className='px-4' scope='col'>Beginning Balance</th>
          <th className='px-4' scope='col'>Interest</th>
          <th className='px-4' scope='col'>Principal</th>
          <th className='px-4' scope='col'>Ending Balace</th>
          <th className='px-4' scope='col'>Status</th>
        </tr>
      </thead>
      <tbody>
        {rowInfo && rowInfo.map((data:any, key:number) => (
          <TableRow data={data} rowNum={key} key={key}/>
        ))}
      </tbody>
    </table>
  )
}

const TableRow:React.FC<any> = ({ data, rowNum }) => {
  return (
    <tr>
      <th className="text-center" scope='row'>{rowNum + 1}</th>
          <td className="text-center">${data.startBalance}</td>
          <td className="text-center">${data.interest.toFixed(2)}</td>
          <td className="text-center">${data.principal}</td>
          <td className="text-center">${data.endingBalance}</td>
          <td className="text-center">
            <input className='m-auto' type="checkbox" />
          </td>
    </tr>
  )
}

//calculate function
const calculateMonth = (start:number,apr:number, pd:number) => {
  const interest = parseFloat((((apr / 12) / 100 * start)).toFixed(2));

  const principal = pd - interest;
  return {
    startBalance: parseFloat(start.toFixed(2)),
    interest,
    principal: parseFloat(principal.toFixed(2)),
    endingBalance: parseFloat((start - principal).toFixed(3))
  }
}

//calculate payment due
const paymentDue = (loanAmount: number, interestRate:number, term:number) => {
  //convert annual rate to monthly
  const convertRate = (interestRate / 12) / 100;

  //convert years to months
  const months = term * 12;

  return parseFloat((((((1 + convertRate) ** months) * convertRate) / ((1 + convertRate) ** months - 1)) * loanAmount).toFixed(2))
}

export default Home
