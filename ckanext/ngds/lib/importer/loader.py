import copy
import ckanext.importlib.loader as loader
from ckanext.importlib.loader import LoaderError
from ckanclient import CkanApiError, CkanApiNotAuthorizedError
from ckan.plugins import toolkit
import os

log = __import__("logging").getLogger(__name__)

class ResourceLoader(loader.ResourceSeriesLoader):

    def __init__(self, ckanclient,field_keys_to_find_pkg_by,resource_dir=None):
        super(ResourceLoader, self).__init__(ckanclient,field_keys_to_find_pkg_by)
        self.resource_dir = resource_dir


    def _write_package(self, pkg_dict, existing_pkg_name, existing_pkg=None):
        '''
        Writes a package (pkg_dict). If there is an existing package to
        be changed, then supply existing_pkg_name. If the caller has already
        got the existing package then pass it in, to save getting it twice.

        May raise LoaderError or CkanApiNotAuthorizedError (which implies API
        key is wrong, so stop).
        '''
        try:
            pkg_dict = self._update_resource(pkg_dict)
        except LoaderError:
            raise
        except Exception, e:
            raise LoaderError('Could not update resources Exception: %s'% e.message)

        super(ResourceLoader, self)._write_package(pkg_dict,existing_pkg_name,existing_pkg)

    def _update_resource(self, pkg_dict):

        if pkg_dict.get('resources') is None:
            return pkg_dict

        for resource in pkg_dict['resources']:

            if resource.get('upload_file'):
                try:
                    #file_path = self.resource_dir+resource['upload_file']
                    file_path = os.path.join(self.resource_dir,resource['upload_file'])
                    #print "File to be uploaded: ",file_path
                    uploaded_file_url,dummy = self.ckanclient.upload_file(file_path)
                    #print "In Update Resource: uploaded_file_url: ", uploaded_file_url
                    resource['url']=uploaded_file_url
                    del resource['upload_file']

                    if resource.get('content_model'):
                        resource['content_model_uri'], resource['content_model_version'] = self.validate_content_model(resource['content_model'], resource.get('content_model_version'))
                        del resource['content_model']

                except CkanApiNotAuthorizedError:
                    raise
                except CkanApiError:
                    raise LoaderError('Error (%s) uploading file over API: %s' % (self.ckanclient.last_status,self.ckanclient.last_message))
                except Exception, e:
                    print "Error Accessing:", e
                    raise
            else:
                if resource.get('content_model') or resource.get('content_model_version'):
                    raise LoaderError("Content Model referenced but no file referenced for upload. Package Title: %s" % pkg_dict.get('title'))

            self.validate_resource(resource)

        return pkg_dict


    def _merge_resources(self, existing_pkg, pkg):
        '''Takes an existing_pkg and merges in resources from the pkg.
        '''
        #log.info("..Merging resources into %s" % existing_pkg["name"])
        #log.debug("....Existing resources:\n%s" % pformat(existing_pkg["resources"]))
        #log.debug("....New resources:\n%s" % pformat(pkg["resources"]))
        #log.info("Entering NGDS merge");

        if existing_pkg["resources"] == [] :
            log.info("As existing resources are empty passing the package resource as new resources.")
            return pkg.copy()

        # check invariant fields aren't different
        warnings = []
        for key in self.field_keys_to_expect_invariant:
            if key in existing_pkg or key in pkg:
                if (existing_pkg.get(key) or None) != (pkg.get(key) or None):
                    warnings.append('%s: %r -> %r' % (key, existing_pkg.get(key), pkg.get(key)))
            else:
                if (existing_pkg['extras'].get(key) or None) != (pkg['extras'].get(key) or None):
                    warnings.append('%s: %r -> %r' % (key, existing_pkg['extras'].get(key), pkg['extras'].get(key)))
                
        if warnings:
            log.warn('Warning: uploading package \'%s\' and surprised to see '
                     'changes in these values:\n%s' % (existing_pkg['name'], 
                                                       '; '.join(warnings)))

        # copy over all fields but use the existing resources
        merged_dict = pkg.copy()
        merged_dict['resources'] = copy.deepcopy(existing_pkg['resources'])

        if pkg.get('resources') is None:
            return merged_dict        

        # merge resources
        for pkg_res in pkg['resources']:
            # look for resource ID already being there
            pkg_res_id = self._get_resource_id(pkg_res)
            for i, existing_res in enumerate(merged_dict['resources']):
                res_id = self._get_resource_id(existing_res)
                if res_id == pkg_res_id:
                    # edit existing resource
                    merged_dict['resources'][i] = pkg_res
                    break
            else:
                # insert new res
                merged_dict['resources'].append(pkg_res)

        return merged_dict    

    def _get_resource_id(self, res):
        #print "Inside NGDS Resource Loader"
        #print "Resource URL ",res.get('name')
        return res.get('name')

    def validate_resource(self, resource_dict):

        print "Inside resource validation"
        validation_response = toolkit.get_action("validate_resource")(None, resource_dict)

        validation_status = validation_response['success']

        if validation_status:
            return True
        else:
            error_msg = '\n'.join(map(str, validation_response['messages']))

            raise LoaderError("Resource validation Failed due to : %s" % error_msg)


    def validate_content_model(self, content_model, version):

        #Validatation method needs to be called.
        cm_dict = {'content_model':content_model,'version':version}
        return  toolkit.get_action("contentmodel_checkBulkFile")(None, cm_dict)



