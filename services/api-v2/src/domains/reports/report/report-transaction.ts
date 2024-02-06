import MovementOfArticleController from "../../movement-of-article/movement-of-article.controller";
import TransactionController from "../../transaction/transaction.controller";

export async function getItem(startDate: string, endDate: string, status: string, transactionType: string[], database: string, dateSelect: string, branch: string) {
  try {

    const match: { [key: string]: any } = {};

    if (transactionType[0].length > 0) {
      const list = transactionType.map(id => ({ $oid: id }));
      match.type = { $in: list };
    }

    if (status[0].length > 0) {
      match.state = { $in: status };
    }

    if (branch !== null) {
      match.branchOrigin = { $oid: branch };
    }

    if (dateSelect && (startDate || endDate)) {
      const startDateValue = `${startDate}T00:00:00Z`;
      const endDateValue = `${endDate}T23:59:59Z`;

      match[dateSelect] = {
        $gte: { $date: startDateValue },
        $lte: { $date: endDateValue }
      };
    }

    const transactions = await new TransactionController(database).getAll({
      project: {
        _id: 1,
        creationDate: 1,
        endDate: 1,
        state: 1,
        type: 1,
        updateDate: 1,
        branchOrigin: 1

      },
      match: match
    })

    const transactionIds = transactions.result.map((transaction: any) => transaction._id);

    const ids = transactionIds.map((id: any) => ({ $oid: id }));
    let pipeline = [
      {
        $match: {
          "transaction": { $in: ids }
        }
      },
      {
        $group: {
          _id: "$code",
          amount: { $sum: "$amount" },
          description: { $first: "$description" }
        }
      },
      {
        $project: {
          code: "$_id",
          amount: 1,
          description: 1
        }
      },
    ];
    

    const result = await new MovementOfArticleController(database).getFullQuery(pipeline);

    return result.result

  } catch (err) {
    console.log(err)
  }
}