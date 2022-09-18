import { Appointment } from '@/appointment/appointment.entity';
import { Category as ECategory } from '@/category/category.entity';
import { Project as EProject } from '@/project/project.entity';

export namespace Seed {
  export interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    size: number;
    httpOnly: boolean;
    secure: boolean;
    session: boolean;
    sameSite?: unknown;
    priority: unknown;
    sameParty: boolean;
    sourceScheme: unknown;
    sourcePort: number;
    partitionKey?: string;
    partitionKeyOpaque?: boolean;
  }

  export interface AuthVerify {
    authenticationIsValid: boolean;
    cookies: Cookie[];
  }

  export interface FullAppointment {
    Worksheet: null;
    Require: null;
    Evaluate: null;
    TotalRows: number;
    PageSize: number;
    Table: null;
    Id: number;
    IdRequire: null;
    IdCustomer: number;
    CustomerName: null;
    IdProject: number;
    ProjectName: null;
    StartDate: null;
    EndDate: null;
    IdCell: number;
    CellName: null;
    IdCategory: number;
    IdManager: number;
    IdDeveloper: number;
    IsMaster: boolean;
    IdAncestor: number;
    DeveloperName: null;
    HourValue: null;
    ExtraValue: null;
    CategoryName: null;
    InformedDate: string;
    Created: null;
    StartTime: string;
    EndTime: string;
    TotalTime: null;
    NotMonetize: boolean;
    Description: string;
    CommitRepository: string | null;
    IsDeleted: boolean;
    TotalTimeInProject: null;
    ConsumedTimeInProject: null;
    IdEvaluate: null;
    IsApprove: null;
    IsReprove: null;
    IsReview: null;
    IsWait: null;
    IsPreApproved: null;
    TimePreApproved: null;
    UserPreApproved: null;
    IsPaid: boolean;
    ConsumedTimeInProjectExceded: boolean;
    TimeInWorksheetExceded: number;
    IsEvaluate: boolean;
    TypeReport: null;
    SumTotalTime: null;
    TotaltimeInMinutes: number;
    IdCustomerPreSelected: null;
    IdProjectPreSelected: null;
    IdDeveloperPreSelected: null;
    IsEvaluatePreSelected: boolean;
  }

  export interface PartialAppointment {
    code?: Appointment['code'];
    status?: Appointment['status'];
  }

  export interface ToCreateAppointment extends PartialAppointment {
    date: Appointment['date'];
    startTime: Appointment['startTime'];
    endTime: Appointment['endTime'];
    notMonetize?: Appointment['notMonetize'];
    description: Appointment['description'];
    commit?: Appointment['commit'];
    projectCode?: EProject['code'];
    categoryCode?: ECategory['code'];
  }

  export interface Client {
    id: string;
    title: string;
  }

  export interface Project {
    Id: number;
    Name: string;
    StartDate: string;
    EndDate: string;
    IdCustomer: number;
  }

  export interface Category {
    Id: number;
    Name: string;
    IdProject: number;
  }
}
