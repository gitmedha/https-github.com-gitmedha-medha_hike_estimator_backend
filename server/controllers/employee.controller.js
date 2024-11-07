const employeeService = require('../services/employee.services');

/**
 * @param {object} req
 * @param {object} res
 */
const getEmployees = async (req, res) => {
  try {

    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'employee_id';
    const sortOrder = req.query.sortOrder || 'asc';

    const result = await employeeService.getEmployeesService(offset,limit,sortBy,sortOrder);

    res.status(200).json(result);
  } catch (error) {

    res.status(500).json({ error: 'Error fetching employees', details: error.message });
  }
};

const getEmployee = async (req,res)=>{
  try {
    const { id } = req.params;
    const result = await employeeService.getEmployeeByID(id);
    res.status(200).json(result);
    
  } catch (error) {
    res.status(500).json({error: 'Error fetching employee', details: error.message})
  }
}

const searchEmployees = async(req, res) => {
  try {
   const {searchValue} = req.body;
   const {from} = req.body.from || null;
   const {to} = req.body.to || null;
    const result = await employeeService.searchEmployees(searchValue,from,to);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error searching employees', details: error.message });
  }
}
const searchPickList = async(req,res) =>{
  try {
    const {dropDownField} = req.params;
    const result = await employeeService.searchPickList(dropDownField);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error searching pick list', details: error.message });
  }
}

module.exports = {
  getEmployees,
  getEmployee,
  searchEmployees,
  searchPickList
};
