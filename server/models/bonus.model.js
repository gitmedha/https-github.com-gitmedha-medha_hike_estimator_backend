const db = require('../config/db');

const getBonus = async(offset,limit,sortBy,sortByOrder)=>{
    try{
        const bonusData = await db('bonus_details')
       .select("*")
       .offset(offset)
       .limit(limit)
       .orderBy(sortBy,sortByOrder);

       const totalCount = await db('bonus_details').count("* as total");
       return {
            totalCount: totalCount[0].total,
            data: bonusData
       };

    }
    catch(error){
        throw new Error(error.message);
    }
}

const getBonusDropdown = async (field)=>{
    try{
        const dropDown = await db('bonus_details')
       .select(field)
       .distinct()
       .orderBy(field, 'asc');

        return dropDown;
    }
    catch(error){
        throw new Error(error.message);
    }
}

const searchBonus = async (searchField, value, offset = 0, limit = 10) => {
    try {
        const bonusData =  await db('bonus_details').select("*").where(`${searchField}`, `${value}`)
        return {
            data: bonusData,
            totalCount: bonusData.length
        }

    } catch (err) {
        console.error('Error searching increment data:', err.message);
        throw new Error(`Error searching increment data: ${err.message}`);
    }
};

const createBonus = async (bonusData) => {
    try {
        const result = await db('bonus_details').insert(bonusData).returning('employee_id');
        return {
            data: result
        }
    } catch (error) {
        console.log(error)
        throw new Error(`Error creating bonus data: ${error.message}`);
    }
}

const getBonusById =async (id)=>{
    try {
        
      const bonusData = await db('bonus_details')
        .select(
          'bonus_details.*',
          'employee_details.department',
          'employee_details.title',
          'employee_details.employee_status'
        )
        .innerJoin(
          'employee_details',
          'bonus_details.employee_id',
          'employee_details.employee_id'
        )
        .where('bonus_details.employee_id', id);
      return bonusData;
    } catch (err) {
      console.error(err);
      throw new Error('Error fetching increment data by ID');
    }
}


const getBonusPickLists = async()=>{
    try {
        const IDS = await getBonusDropdown('employee_id');
        const Names = await getBonusDropdown('full_name');
        const Managers = await getBonusDropdown('manager');

        return {
            IDS,
            Names,
            Managers
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching bonus picklists');
    }
}

const updateBonus = async (id,updateData)=>{
    try{
        const updatedBonus = await db('bonus_details').where('id', id).update(updateData);
        return updatedBonus;
    } catch(error){
        throw new Error(error.message);
    }
}

const insertBulkData = async(data)=>{
    try{
        if(Object.keys(data).length === 6){
            await db('bonus_details').insert({
                employee_id: data.id,
                full_name: data.name,
                kra: parseFloat(parseFloat(data.kra).toFixed(1)),
                compentency: parseFloat(parseFloat(data.competency).toFixed(1)),
                average: parseFloat(parseFloat(data.average).toFixed(1)),
                review_cycle: 'April-Sep 2022',
                manager: data.manager,
            });
        }
        return;
    
    } catch(error){
        throw new Error(error.message);
    }

}

const getPeerRatings = async (managerName,employeeID,reviewCycle)=>{
    try{
        if (!managerName) {
            throw new Error('Manager name is required');
        }
        const peerRatings = await db('bonus_details')
        .select('average').where('manager', managerName)
        .andWhere('review_cycle',reviewCycle)
        .andWhereNot('employee_id',employeeID);
        const peerRatingsList = peerRatings.map(rating => parseFloat(rating.average));
        return peerRatingsList;

    }catch(err){
        console.log(err);
        throw new Error('Error fetching peer ratings');
    }
}

const getAllRatings = async ()=>{
    try{
        const allRatings = await db('bonus_details')
        .select('average')
        // .andWhere('appraisal_cycle',reviewCycle);
        const allRatingsList = allRatings.map(rating => parseFloat(rating.average));
        return allRatingsList;
    }catch(err){
        throw new Error('Error fetching all ratings');
    }
}

const getHistoricalRatings = async (managerName)=>{
    try{
        const historicalRatings = await db('historical_data').select('final_score').where('reviewer',managerName);
        const historicalRatingList = historicalRatings.map(historicalRating=>parseFloat(historicalRating.final_score));
        return historicalRatingList;
    }catch(err){
        throw new Error('Error fetching historical ratings');
    }
}

const deleteBonus = async (id)=>{
    try{
        const deletedBonus = await db('bonus_details').where('id', id).del();
        return deletedBonus;
    } catch(error){
        throw new Error(error.message);
    }
 
}

const updateNormalizedRating = async(id,reviewCycle,ratings) => {
    try {
        const updatedRatings = await db('bonus_details').update({ normalized_ratings: parseFloat(ratings.toFixed(1))})
        .where('employee_id',id)
        .andWhere('review_cycle', reviewCycle)
        .returning('employee_id');
        return updatedRatings;
    } catch (error) {
        throw new Error(`Error updating normalized ratings: ${error.message}`);
    }
}

const calculateBonus = async (normalizedRating,id,reviewCycle)=>{
    try { 
      const result = await db('bonus_measurements')
      .select('ratings', 'bonus')
      .where('ratings', '>=', normalizedRating)
      .orderBy('ratings', 'asc')
      .first(); 

    if (result) {
      await db('bonus_details')
      .where('employee_id', id)
      .andWhere('review_cycle', reviewCycle)
      .update('bonus', result.bonus);
      return result.bonus;
    }

    return null;
        
    } catch (error) {
        throw new Error("Error Fetching bonus: " + error.message);
    }
}
module.exports = {
    getBonus,
    getBonusDropdown,
    searchBonus,
    createBonus,
    getBonusById,
    getBonusPickLists,
    updateBonus,
    insertBulkData,
    getPeerRatings,
    getAllRatings,
    getHistoricalRatings,
    deleteBonus,
    updateNormalizedRating,
    calculateBonus
}