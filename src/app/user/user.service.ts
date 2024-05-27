import { Injectable } from "@angular/core";
import { UserRepository } from "./user.repository";
import { of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private userRepository: UserRepository) {}

  findOneUserById(id?: string) {
    return id ? this.userRepository.findOneUserById(id) : of(null);
  }
}
