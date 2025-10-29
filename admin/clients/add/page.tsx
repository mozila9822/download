'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';

const companies = [
    { id: 'comp1', name: 'Tech Solutions' },
    { id: 'comp2', name: 'Innovate Inc.' },
    { id: 'comp3', name: 'Global Exports' },
    { id: 'comp4', name: 'Market Movers' },
]

export default function AddClientPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Client</CardTitle>
        <CardDescription>
          Fill in the details to create a new client profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" placeholder="e.g., John Doe" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="e.g., john.doe@example.com" />
                    </div>
                </div>
            </div>

            <Separator />
            
            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+1 234 567 890" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="123 Main Street, Anytown, USA" />
                    </div>
                </div>
            </div>

            <Separator />
            
            {/* Company Assignment */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Assignment</h3>
                <div className="max-w-sm">
                    <Label htmlFor="company">Assign to Company</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Documents</h3>
                 <div className="space-y-2">
                    <Label>Upload Documents</Label>
                    <div className="flex items-center justify-center w-full">
                        <Label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, DOCX, or PNG (MAX. 5MB)</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple />
                        </Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Notes</h3>
                <div className="space-y-2">
                    <Label htmlFor="notes">Add a note</Label>
                    <Textarea id="notes" placeholder="Any relevant notes about this client..." rows={4} />
                </div>
            </div>
            
          <div className="flex justify-end pt-4">
            <Button type="submit">Save Client</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
