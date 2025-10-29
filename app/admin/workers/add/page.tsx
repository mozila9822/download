'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createWorker } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const properties = [
    { id: 'prop1', name: 'VoyageHub Downtown' },
    { id: 'prop2', name: 'VoyageHub Seaside' },
    { id: 'prop3', name: 'VoyageHub Mountain View' },
]

const features = [
    { id: 'bookings', label: 'Bookings Management' },
    { id: 'rooms', label: 'Rooms & Properties' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'operations', label: 'Operations' },
]

const initialState = {
  message: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving Staff Member...' : 'Save Staff Member'}
    </Button>
  );
}

export default function AddWorkerPage() {
    const [state, formAction] = useActionState(createWorker, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message && !state.errors) {
            toast({
                title: 'Success!',
                description: state.message,
            });
        }
    }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Staff Member</CardTitle>
        <CardDescription>
          Fill in the details to add a new worker and configure their permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" placeholder="e.g., John Doe" required/>
                         {state.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="e.g., john.doe@voyagehub.com" required/>
                        {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Role and Property Access */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Role & Property Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Staff">Staff</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                        </Select>
                        {state.errors?.role && <p className="text-sm text-destructive">{state.errors.role[0]}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label>Property Access</Label>
                        <div className="space-y-2 rounded-md border p-4">
                            {properties.map(property => (
                                <div key={property.id} className="flex items-center space-x-2">
                                    <Checkbox id={`prop-${property.id}`} name="propertyAccess" value={property.id} />
                                    <Label htmlFor={`prop-${property.id}`} className="font-normal">{property.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Separator />
          
           {/* Feature Permissions */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium">Feature Permissions</h3>
            <p className="text-sm text-muted-foreground">Select the features this staff member can access.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map(feature => (
                    <div key={feature.id} className="space-y-3 rounded-md border p-4">
                        <h4 className="font-semibold">{feature.label}</h4>
                        <div className="flex items-center space-x-2">
                            <Checkbox id={`${feature.id}-view`} name={`permissions-${feature.id}`} value="view"/>
                            <Label htmlFor={`${feature.id}-view`} className="font-normal">View</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id={`${feature.id}-edit`} name={`permissions-${feature.id}`} value="edit"/>
                            <Label htmlFor={`${feature.id}-edit`} className="font-normal">Edit / Modify</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id={`${feature.id}-delete`} name={`permissions-${feature.id}`} value="delete"/>
                            <Label htmlFor={`${feature.id}-delete`} className="font-normal">Delete</Label>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <Separator />

            {/* Security Settings */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Security</h3>
                 <div className="space-y-2 max-w-sm">
                    <Label htmlFor="pin">4-Digit PIN</Label>
                    <Input id="pin" name="pin" type="password" maxLength={4} placeholder="e.g., 1234" />
                    <p className="text-xs text-muted-foreground">Set a PIN for quick access or verification.</p>
                </div>
            </div>
            
            {state.message && state.errors && (
                <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}


          <div className="flex justify-end pt-4">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
