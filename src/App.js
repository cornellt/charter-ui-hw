import './App.css';
import { useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react'
import simulatedData from './data/simulated-data.json'

// Default customer data object
const customerData = {
    customerId: 0,
    monthOnePts: 0,
    monthTwoPts: 0,
    monthThreePts: 0,
    totalPts: 0
}

function App() {
    // Use an array to store the fully processed customer data so that it can be easily displayed in JSX using Array.map()
    const [customerPointsData, setCustomerPointsData] = useState([]);

    // Fetch transaction data on component mount
    useEffect(() => {
        fetchTransactionData();
        // Empty array dependency is necessary to ensure that fetchTransactionData() is only called once
        // eslint-disable-next-line
    }, [])

    // Calculate points based on transaction amount:
    // 1pt is awarded for every dollar x, where $51 <= x <= $100
    // 2pts are awarded for every dollar y, where $101 <= y
    const calculatePoints = (transactionAmount) => {
        let points = 0;
        let intTransAmt = Math.floor(transactionAmount);
        if(intTransAmt > 100) {
            const overOneHundred = intTransAmt - 100;

            //Add points for dollars spent over $100
            points += (overOneHundred * 2);

            //Add points for dollars spent between $51 and $100
            points += 50;
        }
        else if(intTransAmt > 50) {
            const overFifty = intTransAmt - 50;
            points += overFifty;
        }

        return points;
    }

    // Process the transaction data to calculate points per month
    const processTransactionData = (data) => {
        // Start with a map to ensure that each customer is unique / to avoid duplicate customer entries
        let customers = new Map();
        data.forEach(transaction => {
            if(!customers.has(transaction.customer_id)) {
                let newCustomer = Object.create(customerData);
                newCustomer.customerId = transaction.customer_id;
                customers.set(transaction.customer_id, newCustomer);
            }

            const currentCustomer = customers.get(transaction.customer_id);
            const points = calculatePoints(transaction.purchase_amount);

            switch(transaction.month) {
                case 1:
                    currentCustomer.monthOnePts += points;
                    break;
                case 2:
                    currentCustomer.monthTwoPts += points;
                    break;
                case 3:
                    currentCustomer.monthThreePts += points;
                    break;
                default:
                    break;
            }
        });

        // Calculate total points accumulated for each customer after all transactions are processed and push them into an array
        // so the data can be iterated over using Array.map() in JSX
        const customersArray = []
        customers.forEach(customer => {
            customer.totalPts = customer.monthOnePts + customer.monthTwoPts + customer.monthThreePts;
            customersArray.push(customer);
        });

        // Sort the array by customer ID
        const sortedCustomersArray = customersArray.sort((a, b) => {
            return a.customerId - b.customerId;
        });

        // Update state with the calculated customer data
        setCustomerPointsData(sortedCustomersArray);
    }

    // Simulate an async API call to fetch data
    const fetchTransactionData = async () => {
        const data = await simulatedData;

        // Use 1.5s setTimeout to simulate a real-world delayed response from API call
        setTimeout(() => {
            processTransactionData(data.transactions);
        }, 1500);
    }

    return (
        <Box className='App'>
            <TableContainer>
                <Table variant='simple'>
                    <TableCaption>Customer point totals over 3 month period</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Customer ID</Th>
                            <Th isNumeric>Month 1 Points</Th>
                            <Th isNumeric>Month 2 Points</Th>
                            <Th isNumeric>Month 3 Points</Th>
                            <Th isNumeric>Total Points Accumulated</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {customerPointsData.length > 0 && customerPointsData.map(customer => {
                            return (
                                <Tr key={customer.customerId}>
                                    <Td>{customer.customerId}</Td>
                                    <Td isNumeric>{customer.monthOnePts}</Td>
                                    <Td isNumeric>{customer.monthTwoPts}</Td>
                                    <Td isNumeric>{customer.monthThreePts}</Td>
                                    <Td isNumeric>{customer.totalPts}</Td>
                                </Tr>
                            )
                        })}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Customer ID</Th>
                            <Th isNumeric>Month 1 Points</Th>
                            <Th isNumeric>Month 2 Points</Th>
                            <Th isNumeric>Month 3 Points</Th>
                            <Th isNumeric>Total Points Accumulated</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default App;