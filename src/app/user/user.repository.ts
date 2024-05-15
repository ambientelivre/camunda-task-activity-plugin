import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "./user";

@Injectable({
  providedIn: "root",
})
export class UserRepository {
  constructor(private httpClient: HttpClient) {}

  findOneUserById(id: string) {
    return this.httpClient.get<User>(
      `/camunda/api/engine/engine/default/user/${id}/profile`
    );
  }
}
