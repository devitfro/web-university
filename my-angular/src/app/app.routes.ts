import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts.component';
export const routes: Routes = [
 {path:'',redirectTo:'songs',pathMatch:'full'},
 {path:'songs',component:ContactsComponent},
 {path:'songs/:id/edit',component:ContactsComponent},
 {path:'**',redirectTo:'songs'}
];
