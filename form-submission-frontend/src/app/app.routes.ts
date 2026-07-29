import { Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { Form } from './components/form/form';
import { LeaveList } from './components/leave-list/leave-list';
import { AddEmployee } from './components/add-employee/add-employee';
import { EmployeeList } from './components/employee-list/employee-list';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'employees',
        component: EmployeeList
    },
    {
        path: 'request-list',
        component: LeaveList
    },
    {
        path: 'add',
        component: Form
    },
    {
        path: 'add-employee',
        component: AddEmployee
    }
];