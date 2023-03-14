import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";

type StatementType = Pick<
  Statement,
  'user_id' |
  'description' |
  'amount' |
  'type' 
>

interface IRequest {
  user_id: StatementType['user_id']
  type: StatementType['type']
  amount: StatementType['amount']
  description: StatementType['description']
  user_received_id?: string
}

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ user_id, type, amount, description, user_received_id }: IRequest) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === 'withdraw' || type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    if (type === 'transfer'){
      const userThatReceivesTransfer = await this.usersRepository.findById(user_received_id!)

      if (!userThatReceivesTransfer) {
        throw new CreateStatementError.ReceiverNotFound();
      }

      await this.statementsRepository.create({
        user_id: userThatReceivesTransfer.id!,
        sender_id: user.id,
        type,
        amount,
        description
      });
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
